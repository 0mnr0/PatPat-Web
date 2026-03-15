const PatPatCore = {
	version: "0.9.2",
	PatStrength: 0.25,
	UserSettings: {
		animLength: 160,    // ms
		PatVolume: 50,      // 0..100
		PatSpeed: 1,        // 0..2f
		ShowImages: true,   // true|false
		EnableDithering: false
	},
	
	
	PattingRightNow: new WeakSet(),
	LoadedPack: {
		// [HERE]:      -1..1    <--- Offset Percentage (will be multiplied by 100)
		XPosMultiplier: 0,
		YPosMultiplier: 0,
	}, 
	PatPatCoreEnabled: true,
	
	
	patFiles: [
		
	],

	patSounds:  [
	
	],





	loadPackData: async function() {
		PatPatCore.patFiles = [];
		PatPatCore.patSounds = [];
		PatPatCore.loadDefualtAssets();
		PatPatCore.preloadImages();
	},
	
	preloadImages: () => {
		return Promise.all(
			PatPatCore.patFiles.map(url => new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(url);
				img.onerror = reject;
				img.src = url;
			}))
		);
	},
	
	

	preloadSounds: () => {
		const ctx = PatPatCore.getAudioCtx();
		PatPatCore.patSoundBuffers = [];

		return Promise.all(
			PatPatCore.patSounds.map(url => fetch(url)
				.then(response => response.arrayBuffer())
				.then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
				.then(audioBuffer => {
					PatPatCore.patSoundBuffers.push(audioBuffer);
				})
				.catch(e => console.error("Error loading sound:", url, e))
			)
		);
	},



	SharedAudio: { ctx: null },
	getAudioCtx: () => {
	  if (!PatPatCore.SharedAudio.ctx) PatPatCore.SharedAudio.ctx = new (window.AudioContext || window.webkitAudioContext)();
	  return PatPatCore.SharedAudio.ctx;
	},

	decodeAndPlayAudio: async (mediaData, {volume = 1.0, muted = false} = {}, useBuffer = false) => {
	},

	getVolume: () => {
		return Number(PatPatCore.UserSettings.PatVolume)/100
	},


	getAnimationSpeed: () => {
		const Speed = PatPatCore.UserSettings.PatSpeed;
		if (Speed === undefined || Speed === null) {return 1;}
		return Speed;
	},


	runPat: async (element, reRunData) => {
		if (!PatPatCore.PatTools.isRunAllowed(element)) {return}
		// reRunData: {
		//		isAutoPat: [bool],
		//		startStyle: [str],
		//      calculatedTransform: {YScale: ...},
		//      FixedYTranslate: [int]
		// }
		
		
		PatPatCore.PattingRightNow.add(element);
		const isAutoRunning = (reRunData !== undefined);
		
		let startStyle = isAutoRunning ? reRunData.startStyle : PatPatCore.Attribute.getStylesLine(element);
		
		PatPatCore.PatTools.enableTransitions(element);
		let originalTransform = isAutoRunning ? reRunData.originalTransform : PatPatCore.PatTools.getTransform(element, reRunData);
		let transormData = PatPatCore.PatTools.getTransform(element, reRunData);
		let newYTranslate = isAutoRunning ? reRunData.FixedYTranslate : PatPatCore.PatTools.calculateYTransform(element, transormData);
		transormData.YScale = transormData.YScale - PatPatCore.PatStrength;
		transormData.Ytranslate = newYTranslate;
		
		element.style.transform = PatPatCore.PatTools.buildTransform(transormData);
		PatPatCore.PatTools.runSounds();
		
		let overlay = PatPatCore.UserSettings.ShowImages ? (isAutoRunning ? reRunData.overlay : PatPatCore.addOverlay(element)) : null;
		window.getSelection().removeAllRanges();
		let shouldRevevrseAnim = false;
		
		
		let animationFrameSleep = PatPatCore.UserSettings.animLength/PatPatCore.patFiles.length*PatPatCore.getAnimationSpeed();
		for (let i = 0; i < PatPatCore.patFiles.length; i++) {
			const pat = PatPatCore.patFiles[i];
			if (overlay) { 
				overlay.src=pat;
			}
			
			if (i>=(PatPatCore.patFiles.length/2) && !shouldRevevrseAnim) { //start animate ScaleY backwards
				shouldRevevrseAnim = true;
				element.style.transform = PatPatCore.PatTools.buildTransform(originalTransform);
			}
			
			await new Promise(r => setTimeout(r, animationFrameSleep));

		}
		
		
		
		PatPatCore.PatTools.runAdditionalFeatures(element, reRunData);
		

		if (overlay) { overlay.remove(); } // [if] beacuse user can disable image showing
		element.style.cssText = startStyle
		
	},


	PatTools: {
		matrixDefault: "matrix(1, 0, 0, 1, 0, 0)",
		
		isRunAllowed: (element) => {
			if (!PatPatCore.PatPatCoreEnabled) {console.warn('PatPat skipping because this site in a blocklist!'); return false;}
			if (element.classList.contains("theExactPatPatHandAnimation")) return false;
			if (PatPatCore.PattingRightNow.has(element)) return false;

			return true;
		},
		
		calculateYTransform: (element, transformData) => {
			const Y = transformData.Ytranslate;
			const Stretch = element.clientHeight * (PatPatCore.PatStrength/1.5);
			
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
		},
		
		enableTransitions: (element) => {
			let origTransition = PatPatCore.Attribute.get(element, 'transition', 'all');
			let scaleStringRule = `scale ${(PatPatCore.UserSettings.animLength/2)/1000}s, transform ${(PatPatCore.UserSettings.animLength/2)/1000}s`;
			element.style.transition = origTransition + (origTransition.includes(scaleStringRule) ? '' : ', '+scaleStringRule);
		},
		
		
		runAdditionalFeatures: (element, reRunData) => {
			PatPatCore.PattingRightNow.delete(element);
		},
		
		runSounds: () => {
			PatPatCore.decodeAndPlayAudio(PatPatCore.randChoose(PatPatCore.patSounds))
		},
		
		getTransform: (element, reRunData) => {
			if (reRunData && reRunData.calculatedTransform !== undefined) {
				return reRunData.calculatedTransform;
			} else {
				
				// matrix(scale X, -, -, scale Y, Transform X, Transform Y)
				let tranformStyle = PatPatCore.Attribute.get(element, 'transform', PatPatCore.PatTools.matrixDefault); // matrix(1.01, 0, 0, 0.75, 234, 546)
				return PatPatCore.getMatrix(tranformStyle);
			}
		},
		
		buildTransform: (transormData) => {
			return `matrix(${transormData.XScale}, ${transormData.YSkew}, ${transormData.XSkew}, ${transormData.YScale}, ${transormData.Xtranslate}, ${transormData.Ytranslate})`;
		},
	},

	getMatrix: (transform) => {
		const match = transform.match(/matrix\(([^)]+)\)/);
		if (!match) {
			return { XScale:1, YScale:1, Xtranslate:0, Ytranslate:0, XSkew:0, YSkew:0 }
		}

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
		}
	},
	
	
	Attribute: {
		getStylesLine: (element) => {
			
			// const styles = element.style;
			// let elementInLineStyle = '';
			// for (styleAttributeName of styles) {
			//  	elementInLineStyle += (`${styleAttributeName}: ${styles[styleAttributeName]}; `)
			// }
			
			return element.style.cssText;
			
		},
		
		
		existenceValidation: (element, attr) => {
			let FinalAttribute = element.style[attr];
			if (FinalAttribute === 'none' || !FinalAttribute) {return '';}
			return FinalAttribute
		}, 
		
		get: (element, attr, defaultValue=null) => {
			let FinalAttribute = window.getComputedStyle(element)[attr];
			if (FinalAttribute === 'none') {FinalAttribute = defaultValue; }
			return FinalAttribute
		}, 
		
		getScale: (element) => {
			let Scale = Attribute.get(element, 'scale', null)
			if (Scale === null) {Scale = '1 1'}
			Scale = Scale.split(' ');
			
			return {
				XScale: Number(Scale[0]),
				YScale: Number(Scale[1])
			}
		}, 
	},



	addOverlay: (target) => {
		const rect = target.getBoundingClientRect();
		let leftPos = rect.left + window.scrollX;
		let topPos = rect.top + window.scrollY;
		if (PatPatCore.LoadedPack.XPosMultiplier) { leftPos = leftPos + (rect.width * PatPatCore.LoadedPack.XPosMultiplier) }
		if (PatPatCore.LoadedPack.YPosMultiplier) { topPos = topPos + (rect.height * PatPatCore.LoadedPack.YPosMultiplier) }
		
		function ditheringRule() {
			if (
				PatPatCore.UserSettings.EnableDithering && (
				rect.width > (window.innerWidth/2) ||
				rect.height > (window.innerHeight/1.5)
			)) {return true;}
			// OR
			if (PatPatCore.UserSettings.EnableDithering && PatPatCore.UserSettings.ForceDithering) {return true;}
			
			return false;
		}

		
		let overlay;
		overlay = document.createElement('img'); 
		overlay.style.position = 'absolute';
		overlay.style.left = leftPos + 'px';
		overlay.style.top = topPos + 'px';
		overlay.style.width = rect.width + 'px';
		overlay.style.height = rect.height + 'px';
		overlay.src = PatPatCore.patFiles[0];
		overlay.className = `theExactPatPatHandAnimation patClassAnimation ${ditheringRule() ? 'dithering' : ''}`;


		const root = document.body || document.documentElement;
		if (root === document.body) {
			root.after(overlay);
		} else {
			root.appendChild(overlay);
		}

		return overlay;
	},
	
	
	randChoose: (array) => {return array[Math.floor(Math.random()*array.length)]},
	
	DeLoadThings: function() {
		PatPatCore.PatPatCoreEnabled = false;
	}
}


PatPatCore.preloadImages(); PatPatCore.preloadSounds();