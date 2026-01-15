let WorkAllowedOnThisSite = true;
let allowPatKeyPressed = false;

let PatTriggers = {
	keyPressed: false,
	KeyName: isFireFox ? "Control" : "Shift",   // shift on firefox is force-showing contextmenu
	Key: isFireFox ? "ctrlKey" : "shiftKey",
	
	setLastState: (val) => {
		if (val === true || val === false) {
			PatTriggers.keyPressed = val;
			return val;
		} 
		return false;
	},
	
	wasActive: (event) => {
		if (!event) {
			return PatTriggers.keyPressed; // return last state of keyboard capture as no event data is provided
		}
		
		const MouseEvent = PatTriggers.setLastState(event[PatTriggers.Key]); // if MouseEvent captured that Pat key pressed
		if (MouseEvent === true) { return true }
		
		const PointerEvent = PatTriggers.setLastState(event[PatTriggers.Key]); // if PointerEvent captured that Pat key pressed
		if (PointerEvent === true) { return true }		
		
		
		// so we have nothing
		return false;
	}
}



window.addEventListener("keydown", e => { if (e.key === PatTriggers.KeyName) PatTriggers.keyPressed = true; });
window.addEventListener("keyup", e => { if (e.key === PatTriggers.KeyName) PatTriggers.keyPressed = false; });
SupportedElements = ['img', 'svg', 'model-viewer']



let nextPat = null;
function runPatInit() {
	let rules = GetSiteRuleSet(window.location.hostname); if (rules.length > 0) {rules = ", "+rules}
	findAll((SupportedElements.join())+rules).forEach(element => {
		if (patListening.includes(element) || element.className === 'patClassAnimation') {return}
		patListening.push(element);
		
		element.addEventListener("contextmenu", e => { if(PatTriggers.wasActive(e) && WorkAllowedOnThisSite) { e.preventDefault(); e.stopPropagation(); }});
		
		
		
		let rightMouseDownOnElement = false;
		element.addEventListener('mousedown', (e) => {
		    if (e.button === 2) {
				nextPat = element;
				rightMouseDownOnElement = true;
				if(PatTriggers.wasActive(e) && WorkAllowedOnThisSite) { runPatAnimation(element); e.preventDefault() }
		    }
		});

		document.addEventListener('mouseup', (e) => {
		  if (e.button === 2 && rightMouseDownOnElement) {
			rightMouseDownOnElement = false;
			nextPat = null;
		  }
		});

	})
}



let isPaused = false;
let needsUpdate = false;
const THROTTLE_MS = 200;

function throttledRunPatInit() {
  if (!WorkAllowedOnThisSite) {return}
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
    if (!WorkAllowedOnThisSite) {return}
    throttledRunPatInit();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: false
});


let patStyle = document.createElement('style');
patStyle.textContent = `
	.patClassAnimation {
		position: absolute;
		pointer-events: none;
		z-index: 999999999999;
		object-fit: contain;
		border: none; 
		outline: none;
		background-position: center;
	}
	
	.patClassAnimation.dithering {
	   --size: 4px;

	   mask-image:
		    linear-gradient(90deg, #000 50%, rgb(0 0 0 / 40%) 0),
		    linear-gradient(#000 50%, rgb(0 0 0 / 40%) 0);
	  
	   mask-size: var(--size) var(--size);
	   mask-composite: intersect;
	 }
`
document.head.appendChild(patStyle);

