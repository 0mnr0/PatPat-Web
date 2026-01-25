const TriggerKey = isFireFox ? "Alt" : "Shift";

const patListening = [];	
const PatStrength = 0.2;
const PatStretch = 0.5;

const PattingRightNow = new Set();
let IsDataPack = false;
let UserSettings = {};
let LoadedPack = null;
let patFiles = []; // png sequence will be loaded here
let patSounds = []; // ogg sequence will be loaded heere

async function loadPacks() {
	UserSettings = await Settings.getAll();
    const url = BrowserContext.runtime.getURL("etc/packs.json");
    const response = await fetch(url);
    return await response.json()
}




const loadPackData = async function() {
	let PackName = await Settings.get('SelectedPack', 'PatPat Classic');
	let BuiltinPacks = await loadPacks();
	if (isSiteBlockListed()) {
		DeLoadThings();
		return
	}
	IsDataPack = PackName === "@DataPack";
	LoadedPack = BuiltinPacks[PackName];
	
	
	if (IsDataPack) { LoadedPack = await Settings.get('@DataPack', null) }
	
	if (LoadedPack === undefined) {
		alert(`Мы не можем подключить набор ресурсов "${PackName}" в PatPat :(. Выберите другой`);
		return
	}
	patFiles = [];
	patSounds = [];
	const Loaders = ["sequence", "sounds"];
	
	
	
	for (let loader of Loaders) {
		let LOADINGThing = LoadedPack[loader];
		for (let thing of LOADINGThing) {
			let path = IsDataPack ? thing : BrowserContext.runtime.getURL(`etc/${LoadedPack.PackPlace}/${thing}`);
			
			if (loader==="sequence") { 
				patFiles.push(path);
			} else {
				patSounds.push(path);
			}
		}
	}
	preloadImages();
}
loadPackData();


function preloadImages() {
	return Promise.all(
		patFiles.map(url => new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(url);
			img.onerror = reject;
			img.src = url;
		}))
	);
}; 


async function playBase64Audio(base64String, {volume = 1.0, muted = false} = {}) {
	const isMuted = !UserSettings.AllowSound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const base64Data = base64String.split(';base64,')[1] || base64String;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    try {
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = isMuted ? 0 : getVolume();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start();
        return { audioContext, source, gainNode };
    } catch (e) {
        console.error("Failed to decode audio:", e);
    }
}

function getVolume() {
	return Number(UserSettings.PatVolume)/100
}

function isWebAnnouncementIsAllowed() {
	return UserSettings["MakeAnnouncements.Ext"] === true
}

function getAnimationSpeed() {
	const Speed = UserSettings.PatSpeed;
	if (Speed === undefined || Speed === null) {return 1;}
	return Speed;
	
	
	// IF I EVER NEED REVERSE ALGHORYTM:
	if (Speed > 1) {
		
		// for example [1.25]: We Should Speed Up AnEimation
		const Difference = 1 - Speed; // 1 - 1.25  -->  -0.25
		return Speed - Difference; // --> 0.75 
		
	} else {
		// for example [0.75]: We Should Slow Up Animation
		const Difference = 1 - Speed; // 1 - 0.75  -->  0.25
		return Speed + Difference; // --> 1.25 
	}
}


async function runPat(element, reRunData) {
	if (!PatTools.isRunAllowed(element)) {return}
	// reRunData: {
	//		isAutoPat: bool,
	//		startStyle: str,
	//      calculatedTransform: {YScale: ...},
	//      FixedYTranslate: int
	// }
	
	
	PattingRightNow.add(element);
	const isAutoRunning = (reRunData !== undefined);
	
	let startStyle = isAutoRunning ? reRunData.startStyle : Attribute.getStylesLine(element);
	Announce.start(element, isAutoRunning ? reRunData.isAutoPat : false);
	
	
	PatTools.addTransitions(element);
	let originalTransform = isAutoRunning ? reRunData.originalTransform : PatTools.getTransform(element, reRunData);
	let transormData = PatTools.getTransform(element, reRunData);
	let newYTranslate = isAutoRunning ? reRunData.FixedYTranslate : PatTools.calculateYTransform(element, transormData);
	transormData.YScale = transormData.YScale - PatStrength;
	transormData.Ytranslate = newYTranslate;
	
	element.style.transform = PatTools.buildTransform(transormData);
	PatTools.runSounds();
	
	let overlay = UserSettings.ShowImages ? addOverlay(element) : null;
	window.getSelection().removeAllRanges();
	let shouldRevevrseAnim = false;
	
	
	let animationFrameSleep = LoadedPack.animLength/patFiles.length*getAnimationSpeed();
	for (let i = 0; i < patFiles.length; i++) {
		const pat = patFiles[i];
		if (overlay) { overlay.src = pat; }
		
		if (i>=(patFiles.length/2) && !shouldRevevrseAnim) { //start animate scale backwards
			shouldRevevrseAnim = true;
			element.style.transform = PatTools.buildTransform(originalTransform);
		}
		await sleep(animationFrameSleep);
	}
	
	if (overlay) { overlay.remove(); }
	PatTools.runAdditionalFeatures(element, reRunData);
	
	if (nextPat) {
		let newReRun = reRunData;
		if (!reRunData) {
			newReRun = {
				isAutoPat: true,
				startStyle: startStyle,
				originalTransform: originalTransform,
				FixedYTranslate: newYTranslate
			}
		} 
		await runPat(element, newReRun);
	}
	if (!nextPat && isAutoRunning || !nextPat && !isAutoRunning) {
		element.style = startStyle
	}
	
	
	
}



const PatTools = {
	matrixDefault: "matrix(1, 0, 0, 1, 0, 0)",
	
	isRunAllowed: (element) => {
		if (!WorkAllowedOnThisSite) {console.warn('PatPat skipping because this site in a blocklist!'); return false;}
		if (element.classList.contains("theExactPatPatHandAnimation")) return false;
		if (!LoadedPack || PattingRightNow.has(element)) return false;
		if (patListening.includes(element.parentElement)) {return false;}

		return true;
	},
	
	calculateYTransform: (element, transformData) => {
		const Y = transformData.Ytranslate;
		const Stretch = element.clientHeight * (PatStrength/1.5);
		
		if (Y > 0) {
			return Y + Stretch;
			// OR: return Y * (PatStrength + 1);
		}
		if (Y < 0) {
			return Y - Stretch;
			// OR: return Y / (PatStrength + 1);
		}
		if (Y === 0) {
			return Stretch;
		}
		
		
		// Есть другой метод, который основывается на процентаже (если мне вдруг это понадобится):
		// IF translateY(-50%) then:
		//     Y / (0.25 + 1) -> двигаем вниз на всё пространство что сжали
		
		// if translateY(50%) then:
		//     Y * (0.25 + 1) -> сдвигаем вниз на всё пространство что сжали
		
		// if translateY(0px) then:
		//     Расчитываем высоту элемента и сдвигаем его на половину от PatStrength (хз почему на половину но если сдвинуть на PatStrength - будет перееезд)
		//     сдвигаем вниз на всё пространство что сжали
		// 	   P.S. сейчас установлено полтора потому что на момент написания этого текста мне кажется это идеальным по отношеню сдвига центра объекта
	},
	
	addTransitions: (element) => {
		let origTransition = Attribute.get(element, 'transition', 'all');
		let scaleStringRule = `scale ${(LoadedPack.animLength/2)/1000}s, transform ${(LoadedPack.animLength/2)/1000}s`;
		element.style.transition = origTransition + (origTransition.includes(scaleStringRule) ? '' : ', '+scaleStringRule);
		
		
	},
	
	
	runAdditionalFeatures: (element, reRunData) => {
		PattingRightNow.delete(element);
		SuperFeatures.run(element);
		Stats.add(element);
		Announce.end(element, (reRunData) ? reRunData.isAutoPat : false);
	},
	
	runSounds: () => {
		if (IsDataPack) {
			playBase64Audio(randChoose(patSounds))
		} else {
			let Sound = new Audio(randChoose(patSounds)); 
			Sound.muted = !UserSettings.AllowSound;
			Sound.volume = getVolume();
			Sound.play();
		}
	},
	
	getTransform: (element, reRunData) => {
		if (reRunData && reRunData.calculatedTransform !== undefined) {
			return reRunData.calculatedTransform;
		} else {
			
			// matrix(scale X, -, -, scale Y, Transform X, Transform Y)
			let tranformStyle = Attribute.get(element, 'transform', PatTools.matrixDefault); // matrix(1.01, 0, 0, 0.75, 234, 546)
			return getMatrix(tranformStyle);
		}
	},
	
	buildTransform: (transormData) => {
		return `matrix(${transormData.XScale}, ${transormData.YSkew}, ${transormData.XSkew}, ${transormData.YScale}, ${transormData.Xtranslate}, ${transormData.Ytranslate})`;
	},
}






function getMatrix(transform) {
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return null;

  const [a, b, c, d, e, f] = match[1]
    .split(',')
    .map(v => parseFloat(v.trim()));

  return {
    XScale: a,
    YScale: d,
    Xtranslate: e,
    Ytranslate: f,
    XSkew: c,
    YSkew: b
  };
}



function addOverlay(target) {
	const rect = target.getBoundingClientRect();
	let leftPos = rect.left + window.scrollX;
	let topPos = rect.top + window.scrollY;
	if (LoadedPack.XPosMultiplier) { leftPos = leftPos + (rect.width * LoadedPack.XPosMultiplier) }
	if (LoadedPack.YPosMultiplier) { topPos = topPos + (rect.height * LoadedPack.YPosMultiplier) }
	
	function ditheringRule() {
		if (
			UserSettings.EnableDithering && (
			rect.width > (window.innerWidth/2) ||
			rect.height > (window.innerHeight/1.5)
		)) {return true;}
		// OR
		if (UserSettings.EnableDithering && UserSettings.ForceDithering) {return true;}
		
		return false;
	}

	const overlay = document.createElement('img');
	overlay.className = `theExactPatPatHandAnimation patClassAnimation ${ditheringRule() ? 'dithering' : ''} `;
	overlay.style.left = leftPos +'px';
	overlay.style.top = topPos + 'px';
	overlay.style.width = rect.width + 'px';
	overlay.style.height = rect.height + 'px';
	overlay.src = patFiles[0];
	document.body.after(overlay);
	return overlay;
}



const Announce = {
	start: async (whatTriggered, isAutoClicked) => {
		if (!isWebAnnouncementIsAllowed()) {return}
		
		if (!whatTriggered.dataset.patPatWebExtension) {
			whatTriggered.dataset.patPatWebExtension = crypto.randomUUID();
		}

		const patEvent = new CustomEvent(`dsvl0.PatPatWeb.Extension.startAnimation`, {
			detail: JSON.stringify({
				AnimationLength: LoadedPack.animLength,
				AnimationDuration: UserSettings.PatSpeed,
				PatPackName: await Settings.get('SelectedPack', 'PatPat Classic'),
				elementSelector: `[data-pat-pat-web-extension="${whatTriggered.dataset.patPatWebExtension}"]`,
				autoClicked: isAutoClicked
			})
		});
		document.dispatchEvent(patEvent);
	},
	end: async (whatTriggered, isAutoClicked) => {
		if (!isWebAnnouncementIsAllowed()) {return}

		const patEvent = new CustomEvent(`dsvl0.PatPatWeb.Extension.endAnimation`, {
			detail: JSON.stringify({
				AnimationLength: UserSettings.PatSpeed,
				AnimationDuration: LoadedPack.animLength,
				PatPackName: await Settings.get('SelectedPack', 'PatPat Classic'),
				elementSelector: `[data-pat-pat-web-extension="${whatTriggered.dataset.patPatWebExtension}"]`,
				autoClicked: isAutoClicked
			})
		});
		document.dispatchEvent(patEvent);
	}
	
	
	
	
	// You can setup listener for this using this:
	
	//  document.addEventListener("dsvl0.PatPatWeb.Extension.startAnimation", (e) => {
	//		const details = JSON.parse(e.detail);
	//		console.log('PatEvent:', details);
	//		console.log('Element:', document.querySelector(details.elementSelector));
	//  });

}












function randChoose(array) {return array[Math.floor(Math.random()*array.length)]}


let PossibleContextMenuPatPat = null;
const ContextMenuContainer = isFireFox ? document : window;

ContextMenuContainer.addEventListener("contextmenu", e => {
	PossibleContextMenuPatPat = e.target;
	if (WorkAllowedOnThisSite && PatTriggers.wasActive(e)) {
		e.preventDefault();
		e.stopPropagation();
		if (containBackgroundImage(PossibleContextMenuPatPat)) {}
	}
}, true);


function containBackgroundImage(element) {
	let bgImg = Attribute.get(element, 'background-image');
	let result = null;
			
	if (bgImg && bgImg.includes('url("')) {
		result = element;
	}
	return result;
}


BrowserContext.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === "PatPat.events.SettingsChange" && WorkAllowedOnThisSite) {
	    await loadPackData();
    }
	
	if (msg.type === "PatPat.It.Item" && WorkAllowedOnThisSite && PossibleContextMenuPatPat) {
		
	    for (let i = 0; i < 5; i++) {
			await runPat(PossibleContextMenuPatPat);
		}
		lastClickedElement = null;
    }
});



const DeLoadThings = () => {
	WorkAllowedOnThisSite = false;
	if (patStyle) {patStyle.remove();}
	
	
	// clear ram a bit
	IsDataPack = false;
	UserSettings = {};
	LoadedPack = null;
	patFiles = [];
	patSounds = [];
}

function isSiteBlockListed() {
	return (UserSettings.IgnoreSites.includes(getSiteDomainName()) || UserSettings.IgnoreSites.includes(getSiteDomainName().replace('www.','')))
}
function getSiteDomainName() {
	return location.host;
}
