function getImageSource(element) {
    if (!(element instanceof Element)) return null;

    // <img>
    if (element.tagName.toLowerCase() === 'img') {
        const rawSrc = element.getAttribute('src');
        if (!rawSrc) return null;

        const absoluteSrc = new URL(rawSrc, document.baseURI).href;

        return {
            type: 'img',
            src: absoluteSrc
        };
    }

    // <svg>
    if (element.tagName.toLowerCase() === 'svg') {
        return {
            type: 'svg',
            src: element.innerHTML.trim()
        };
    }

    return null;
}



const Stats = {
	get: async () => {
		return await Settings.get("UserStats", {})
	},
	
	initIfEmpty: (statsObj) => {
		
		if (statsObj.sites === undefined) {
			statsObj.sites = {}
		}
		
		if (statsObj.topPated === undefined) {
			statsObj.topPated = {}
		}
		
		if (statsObj.packsUsage === undefined) {
			statsObj.packsUsage = {}
		}
		return statsObj;
		
	},
	
	add: async (element) => {		
		const siteDomain = getSiteDomainName().replace('www.','');
		currentStats = await Stats.get();
		currentStats = Stats.initIfEmpty(currentStats);
		
		
		
		// Count for site pat's
		if (currentStats.sites[siteDomain] === undefined) { currentStats.sites[siteDomain] = 0; }
		currentStats.sites[siteDomain] = currentStats.sites[siteDomain] + 1;
		
		
		await Settings.set("UserStats", currentStats);
	}
}