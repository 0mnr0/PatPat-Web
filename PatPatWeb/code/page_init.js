let WorkAllowedOnThisSite = true;
let allowPatKeyPressed = false;
const SupportedElements = ['img', 'svg', 'model-viewer'];
let rules = GetSiteRuleSet(window.location.hostname); if (rules.length > 0) {rules = ", "+rules}
const targetSelectors = 'img, svg, model-viewer, div.viewBox'+rules;
const isSvgPage = !document.body && document.documentElement.tagName.toLowerCase() === 'svg';

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




let nextPat = null;
function runPatInit(element, inObjectTag) {
	if (patListening.has(element) || element.className === 'patClassAnimation') {return}
	patListening.add(element);
	

	
	element.addEventListener('mousedown', (e) => { 
		if (e.button === 2) {
			nextPat = element;
			isMouseDownOnAnyElement = true;
			if(PatTriggers.wasActive(e) && WorkAllowedOnThisSite) { runPat(element); e.preventDefault() }
		}
	});
	
	if (inObjectTag) {
		runAdditionalListeners(element);
	}
	
}

function runAdditionalListeners(element) {
	element.addEventListener('mouseup', (e) => { 
		if (e.button === 2) {
			nextPat = null;
			isMouseDownOnAnyElement = false;
		}
	});
	element.addEventListener('contextmenu', (e) => { 
		if (e.button === 2 && WorkAllowedOnThisSite && (PatTriggers.wasActive(e) || true)) { // ( "|| true" to update last states )
			isMouseDownOnAnyElement = false;
			nextPat = null;
		}
		e.preventDefault();
	});
}

function handleObject(el) {
  const process = () => {
    try {
        const innerDoc = el.contentDocument;
        if (!innerDoc) return;
        innerDoc.querySelectorAll("img, svg").forEach(e => {runPatInit(e, true);});
	    // im not using "targetSelectors" here bc it can be different domain name
	  
    } catch (e) {} // can be CORS errors, and potentially, if (el.contentDocument) is null
  };

  if (el.contentDocument) {
    process();
  } else {
    el.addEventListener("load", process);
  }
}





// More optimized dom listener


function processNode(node) {
    if (node.nodeType !== 1) {return}

	log(node.tagName.toLowerCase() === "object", node)
	if (node.tagName.toLowerCase() === "object" && !patListening.has(node)) { // some special work for included documents in DOM
		handleObject(node);
		log(node);
		return;
	}
	
    if (node.matches(targetSelectors)) {
        if (!patListening.has(node)) {
            runPatInit(node);
        }
    }

    if (node.childElementCount > 0) {
        const children = node.querySelectorAll(targetSelectors);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!patListening.has(child)) {
                runPatInit(child);
            }
        }
    }
}

function initialScan() {
    if (typeof WorkAllowedOnThisSite !== 'undefined' && !WorkAllowedOnThisSite) return;
    
    const elements = document.querySelectorAll("object,"+targetSelectors);
    for (let i = 0; i < elements.length; i++) {
        processNode(elements[i]);
    }
}

const observer = new MutationObserver((mutations) => {
    if (typeof WorkAllowedOnThisSite !== 'undefined' && !WorkAllowedOnThisSite) return;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                processNode(mutation.addedNodes[i]);
            }
        }
    }
});

if (typeof WorkAllowedOnThisSite === 'undefined' || WorkAllowedOnThisSite) {
    initialScan();

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}