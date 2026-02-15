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
		let loadedState = 0;
		let calcedAnimLength = LoadedPack.animLength*getAnimationSpeed();
		const sourceImage = new Image();
		sourceImage.crossOrigin = "anonymous";
		sourceImage.src = element.src;
		sourceImage.onload = () => {
			loadedState = 1;
			ctx.drawImage(sourceImage, 0, 0);
			canvas.width = sourceImage.naturalWidth; 
			canvas.height = sourceImage.naturalHeight;
			
			if (canvas.width === 0) {
				canvas.width = 400; canvas.height = 400;
			}
		};
		sourceImage.onerror = () => {
			loadedState = -1;
		}
		
		
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { alpha: true });
		
		let overlayData = {width: null, height: null};
		const overlayImages = Recorder.getOverlayImages();
		
		
		
		
		
		
		async function render(elapsed, calcedAnimLength) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let overlayImg = Recorder.calculateCurrentImage(overlayImages, elapsed, calcedAnimLength);
			
			let YScalePercentage = Recorder.calculateImageScale(elapsed, calcedAnimLength);
		    ctx.drawImage(sourceImage,
						0,
						canvas.height - (canvas.height * YScalePercentage),
						canvas.width,
						canvas.height * YScalePercentage);
			
			
			let calcedView = Recorder.calculateOverlayViews(canvas, {width: overlayImg.naturalWidth, height: overlayImg.naturalHeight});
			ctx.drawImage(
				overlayImg,
				calcedView.offsetLeft,
				0,
				calcedView.overlayWidth,
				calcedView.overlayHeight	
			);
		}
		await render(0, calcedAnimLength);
		await sleep(100);
		
		
		const stream = canvas.captureStream(60); // FPS
		const recorder = new MediaRecorder(stream, {
		  mimeType: MediaRecorder.isTypeSupported("video/webm; codecs=vp9") 
                  ? "video/webm; codecs=vp9" 
                  : "video/webm"
		});

		const chunks = [];
		recorder.ondataavailable = e => {
			if (e.data.size > 0) chunks.push(e.data);
		};

		recorder.onstop = () => {
		  const blob = new Blob(chunks, { type: "video/webm" });
		  const url = URL.createObjectURL(blob);

		  const a = document.createElement("a");
		  a.href = url;
		  a.download = "animation.webm";
		  a.click();
		};
		
		while (sourceImage === 0) {
			log("sourceImage:", sourceImage);
			await sleep(100);
		} if (sourceImage === -1) {return}
		
		recorder.start();
		
		
		
		const FPS = 30;
		let animationFrameSleep = 1000 / FPS;
		let elapsed = 0;
		const start = performance.now();
		while (elapsed < calcedAnimLength) {
			elapsed = performance.now() - start;
			await render(elapsed, calcedAnimLength);
			await sleep(animationFrameSleep);
		}
		recorder.stop();

	}

}


























