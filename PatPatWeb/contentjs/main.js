const isFireFox = navigator.userAgent.toLowerCase().includes('firefox');
const BrowserContext = (typeof chrome === 'object') ? chrome : browser;
const TriggerKey = isFireFox ? "Alt" : "Shift";

const patListening = [];
const PatAll = false;

const SupportedElements = 
	PatAll ? ['span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'svg', 'video', 'button']
	: ['img', 'svg'];
	
const PatStrength = 0.25;
const PatAnimationLength = 300;
let VerticalOffset = 0.98; // Will be calculating --> origElement.offsetTop * (0.98)

const PattingRightNow = new Set();
const patFiles = [
	BrowserContext.runtime.getURL("etc/hand/pat0.png"),
	BrowserContext.runtime.getURL("etc/hand/pat1.png"),
	BrowserContext.runtime.getURL("etc/hand/pat2.png"),
	BrowserContext.runtime.getURL("etc/hand/pat3.png"),
	BrowserContext.runtime.getURL("etc/hand/pat4.png")
];




function preloadImages() {
	return Promise.all(
		patFiles.map(url => new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(url);
			img.onerror = reject;
			img.src = url;
		}))
	);
}; preloadImages();



async function runPatAnimation(element) {
	if (PattingRightNow.has(element)) return;
	if (SupportedElements.includes(element.parentElement.nodeName.toLowerCase())) {return}
	
	let origScale = element.scale; if (origScale == '' || origScale === undefined) {origScale = '1'}
	let origTransition = element.transition; if (origTransition == '' || origTransition === undefined) {origTransition = 'all'}
	let origTransformOrigin = element.transform;
	
	
	let splitScale = origScale.split(' ');
	if (splitScale == '' || splitScale=='none') {splitScale = [1, 1];}
	let origXScale = splitScale[0];
	let origYScale = splitScale[1];
	
	
	let newYScale = null;
	if (origYScale) {newYScale = parseFloat(origYScale)-PatStrength} else {newYScale = 1 - PatStrength};
	let scaleStringRule = `scale ${PatAnimationLength/2}ms`;
	
	element.style.transition = origTransition + (origTransition.includes(scaleStringRule) ? '' : ', '+scaleStringRule);
	element.style.scale = origXScale+' '+newYScale;
	element.style.transformOrigin = 'bottom';
	let overlay = addOverlay(element);
	PattingRightNow.add(element);
	
	let goBackAnim = false;
	for (let i = 0; i < patFiles.length; i++) {
		const pat = patFiles[i];
		overlay.src = pat;
		
		
		
		if (i>(patFiles.length/2) && !goBackAnim) { //start animate scale backwards
			goBackAnim = true;
			element.style.scale = origScale;
		}
		await sleep(PatAnimationLength/patFiles.length);
	}
	

	overlay.remove();
	element.style.transformOrigin = origTransformOrigin;
	PattingRightNow.delete(element);
}




let shiftPressed = false;
window.addEventListener("keydown", e => { if (e.key === "Shift") shiftPressed = true; });
window.addEventListener("keyup", e => { if (e.key === "Shift") shiftPressed = false; });



function runPatInit() {
	findAll('body '+(SupportedElements.join())).forEach(element => {
		if (patListening.includes(element) || element.className === 'patClassAnimation') {return}
		patListening.push(element)
		
		
		let shiftPressed = false;
		body.addEventListener("keydown", e => {
			if (e.key === TriggerKey) { shiftPressed = true; }
		});

		body.addEventListener("keyup", e => {
			if (e.key === TriggerKey) { shiftPressed = false; }
		});
		element.tabIndex = 0;
		element.addEventListener("mousedown", e => {
			if (e.button === 2 && shiftPressed) {
				e.preventDefault();
				runPatAnimation(element);
			}
		});
		element.addEventListener("contextmenu", e => e.preventDefault());
	})
}




function addOverlay(target) {
	const rect = target.getBoundingClientRect();

	const overlay = document.createElement('img');
	overlay.className = 'patClassAnimation';
	overlay.style.left = rect.left + window.scrollX + 'px';
	overlay.style.top = rect.top + window.scrollY + 'px';
	overlay.style.width = (rect.width*VerticalOffset) + 'px';
	overlay.style.height = rect.height + 'px';
	overlay.src = patFiles[0];
	document.body.after(overlay);
	return overlay;
}

function getScale(el) {
  const transform = getComputedStyle(el).transform;
  if (transform === 'none') {
    return { scaleX: 1, scaleY: 1 };
  }

  const values = transform.match(/matrix\(([^)]+)\)/);
  if (!values) return { scaleX: 1, scaleY: 1 };

  const [a, b, c, d] = values[1].split(',').map(Number);

  return {
    scaleX: Math.sqrt(a * a + b * b),
    scaleY: Math.sqrt(c * c + d * d),
  };
}




document.addEventListener("contextmenu", e => {
	if (e.shiftKey) {
		e.preventDefault();
	}
}, true);



let isPaused = false;
let needsUpdate = false;
const THROTTLE_MS = 200;

function throttledRunPatInit() {
  if (isPaused) {
    needsUpdate = true;
    return;
  }

  runPatInit();
  isPaused = true;
  setTimeout(() => {
    isPaused = false;

    if (needsUpdate) {
      needsUpdate = false;
      throttledRunPatInit();
    }
  }, THROTTLE_MS);

}

const observer = new MutationObserver((mutations) => {
    throttledRunPatInit();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});


let patStyle = document.createElement('style');
patStyle.textContent = `
	.patClassAnimation {
		position: absolute;
		pointer-events: none;
		z-index: 9999;
		object-fit: contain;
		border: none; 
		outline: none;
		background-position: center;
	}
`
document.head.appendChild(patStyle);