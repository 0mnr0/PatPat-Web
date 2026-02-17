const Recorder = {
	getOverlayImages: () => {
		let imgArray = [];
		for (patFile of patFiles) {
			const sourceImage = new Image();
			sourceImage.crossOrigin = "anonymous";
			sourceImage.src = patFile;
			imgArray.push(sourceImage);
		}
		return imgArray;
	},
	
	calculateImageScale: (currentTime, totalTime) => {		
		let index = ( currentTime / totalTime );
		if (index > 0.5) { index = 1 - index; }
		const t = Math.min(Math.max(index / 0.5, 0), 1);
		const easeOut = 1 - Math.pow(1 - t, 1.6); // smth like ease-out
		return 1 + (0.75 - 1) * easeOut;
	},
	
	calculateCurrentImage: (imgArray, currentTime, totalTime) => {		
		function pickByNumber(arr, num) {
			  const index = Math.min(
				arr.length - 1,
				Math.floor(num * arr.length)
			  );
			  return arr[index];
		}
		
		let index = currentTime / totalTime;
		if (index > 1) {return imgArray[0]}
		return pickByNumber(imgArray, index);
	},
	
	
	calculateOverlayViews: (canvas, overlayData) => {
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		const overlayOrigWidth = overlayData.width;
		const overlayOrigHeight = overlayData.height;

		const scaleWidth = canvasWidth / overlayOrigWidth;
		const scaleHeight = canvasHeight / overlayOrigHeight;

		const scale = Math.min(scaleWidth, scaleHeight);

		const newWidth = overlayOrigWidth * scale;
		const newHeight = overlayOrigHeight * scale;

		const offsetLeft = (canvasWidth - newWidth) / 2;

		return {
			offsetLeft: offsetLeft,
			overlayWidth: newWidth,
			overlayHeight: newHeight
		};
	},


	go: async (element) => {
		let canceled = false; let ToastID;
		function cancelRender() {
			canceled = true;
			Toast.close(ToastID);
			Toast.create("Meme generation canceled!", 2500, { closeText: "OK" });
		};
		
		ToastID = Toast.create(Translate("Recorder.MemeIsGenerating.Text"), -1, {
			closeText: Translate("Recorder.MemeIsGenerating.Button"),
			closeCallback: cancelRender,
			progressBar: true,
			progressIsDeterminate: true,
		});
		
		
		const FPS = 30;
		let calcedAnimLength = LoadedPack.animLength * getAnimationSpeed();

		const sourceImage = new Image();
		sourceImage.crossOrigin = "anonymous";
		sourceImage.src = element.src;

		await new Promise((resolve, reject) => {
			sourceImage.onload = () => resolve();
			sourceImage.onerror = () => reject(new Error('source image load error'));
		}).catch(err => {
			console.error(err);
			return;
		});

		const canvas = document.createElement('canvas');
		canvas.width = sourceImage.naturalWidth || 400;
		canvas.height = sourceImage.naturalHeight || 400;

		const ctx = canvas.getContext('2d', { alpha: true });
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

		const overlayImages = Recorder.getOverlayImages();

		function render(elapsed, calcedAnimLength) {
			if (canceled) {return}
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			
			let YScalePercentage = Recorder.calculateImageScale(elapsed, calcedAnimLength);
			ctx.drawImage(
				sourceImage,
				0,
				canvas.height - (canvas.height * YScalePercentage),
				canvas.width,
				canvas.height * YScalePercentage
			);

			const overlayImg = Recorder.calculateCurrentImage(overlayImages, elapsed, calcedAnimLength);
			if (overlayImg && overlayImg.naturalWidth) {
				const calcedView = Recorder.calculateOverlayViews(canvas, { width: overlayImg.naturalWidth, height: overlayImg.naturalHeight });
				ctx.drawImage(
				overlayImg,
				calcedView.offsetLeft,
				0,
				calcedView.overlayWidth,
				calcedView.overlayHeight
				);
			}
		}
		
		
		render(0, calcedAnimLength);
		await new Promise(r => setTimeout(r, 50));

		const stream = canvas.captureStream(FPS);
		const recorder = new MediaRecorder(stream, {
			mimeType: MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm"
		});

		const chunks = [];
		recorder.ondataavailable = e => { if (e.data.size > 0 && !canceled) chunks.push(e.data); };
		recorder.onstop = () => {
			if (canceled) {Toast.fadeOutAndRemove(ToastID); return}
			Toast.setText(ToastID, Translate("Recorder.Downloading.Text"));
			const blob = new Blob(chunks, { type: "video/webm" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "animation.webm";
			a.click();
			Toast.setText(ToastID, Translate("Recorder.Done.Text"));
			Toast.setCancelText(ToastID, Translate("OK"));
			Toast.setIgnoreCallback(true);
			
			setTimeout(() => {
				Toast.fadeOutAndRemove(ToastID);
			}, 1500);
		};

		recorder.start();

		
		
		const frameDelay = 1000 / FPS;
		const start = performance.now();
		let elapsed = 0;
		while (elapsed < calcedAnimLength) {
			if (canceled) {
				recorder.stop(); break;
			}
			elapsed = performance.now() - start;
			render(elapsed, calcedAnimLength);
			Toast.setProgress(ToastID, (elapsed/calcedAnimLength) * 100);
			await new Promise(r => setTimeout(r, frameDelay));
		}

		recorder.stop();
	}


}


























