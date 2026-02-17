const Toast = {
	get: (id) => { return find('div.PatPatExtensionToast#id'+id) },
	find: (id) => { return find('div.PatPatExtensionToast#id'+id) },
	create: function(text, len, additionalData) {
		// additionalData: {
		//      closeText: [str],
		//      closeCallback: [function],
		//      progressBar: [bool],
		//      progressIsDeterminate: [bool]
		// }
		let closeText = additionalData.closeText;
		let progressBar = additionalData.progressBar === true;
		let DeterminateProgressBar  = additionalData.progressIsDeterminate === true;
		
		
		if (len === undefined) {len = 2000;}
		if (len < 0 && typeof closeText !== 'string') {
			throw "Если длина показа бесконечная - тогда должна быть кнопка закрывающаяя Toast"
		}
		if (len < 0 && closeText.replaceAll(" ",'').length <= 0) {
			throw "Please Specify text of !"
		}
		let newToast = document.createElement('div');
		const ToastID = random(1000, 10000);
		newToast.id = 'id'+ToastID;
		newToast.className = 'PatPatExtensionToast';
		newToast.innerHTML = `
		
		<span class="text"> ${text} </span>
		${typeof closeText === 'string' ? `<button class="close"> ${closeText} </button>` : ""}
		
		${
			progressBar ? `
				<span class="PatPat_ProgressBar ${DeterminateProgressBar ? 'Determinate' : 'InDeterminate'}">
					<span id="progressValue"></span>
				</span>
			` : ''
		}

		
		`;
		
		body.appendChild(newToast);
		let closeBtn = newToast.querySelector("button.close");
		if (typeof closeText === 'string' && closeBtn) {
			closeBtn.addEventListener('click', () => {
				if (closeBtn.getAttribute("IGNORE") === "true") {return}
				
				Toast.fadeOutAndRemove(ToastID);
				if (typeof additionalData.closeCallback === "function") {additionalData.closeCallback();}
			});
		}
		setTimeout(() => {
			newToast.classList.add('visible');
		}, 10)
		
		
		if (len >= 0) {
			setTimeout(() => {
				Toast.fadeOutAndRemove(ToastID);
			}, len)
		}
		
		return ToastID;
	},
	fadeOutAndRemove: (id) => {
		let someToast = Toast.get(id);
		if (!someToast) {return}
		someToast.classList.remove('visible');
		setTimeout(() => {someToast.remove();}, 500);
	},
	remove: (id, force) => {
		let someToast = Toast.get(id);
		force ? someToast.remove() : Toast.fadeOutAndRemove(id)
	},
	setProgress: (id, percentage) => {
		let someToast = Toast.get(id);
		someToast.querySelector("span#progressValue").style.width = percentage+"%";
	},
	setText: (id, text) => {
		let someToast = Toast.get(id);
		someToast.querySelector("span.text").textContent = text;
	},
	setCancelText: (id, text) => {
		let someToast = Toast.get(id);
		someToast.querySelector("button.close").textContent = text;
	},
	setIgnoreCallback: (id, status) => {
		let someToast = Toast.get(id); if (!someToast) {return}
		someToast.querySelector("button.close").setAttribute("IGNORE", status);
	}
}

Toast.close = Toast.remove;