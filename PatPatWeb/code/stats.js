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
	getYear: () => { return new Date().getFullYear() },
	
	get: async () => {
		let stats = await Settings.get("UserStats", {});
		if (stats.note === undefined) {
			stats.note = "Any of this data will NOT be sended anywhere. This is local and only local data-usage. Later i'll add feature that shows user stats (or maybe i'll make it as spotify wrapped)"
		}
		
		const StatsYear = Stats.getYear();
		let YearStatsContext = stats[StatsYear];
		
		if (!YearStatsContext) {
			YearStatsContext = {};
			stats[StatsYear] = YearStatsContext;
		}
		return stats;
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
		let allStats = await Stats.get();
		currentStats = allStats[Stats.getYear()];
		currentStats = Stats.initIfEmpty(currentStats);
		
		
		
		// Count for site pat's
		if (currentStats.sites[siteDomain] === undefined) { currentStats.sites[siteDomain] = 0; }
		currentStats.sites[siteDomain] = currentStats.sites[siteDomain] + 1;
		
		
		
		// Count for packs usage
		if (currentStats.packsUsage[UserSettings.SelectedPack] === undefined) { currentStats.packsUsage[UserSettings.SelectedPack] = 0; }
		currentStats.packsUsage[UserSettings.SelectedPack] = currentStats.packsUsage[UserSettings.SelectedPack] + 1;
		
		
		// Count for top pated 
		const patSource = getImageSource(element);
		if (patSource !== null) {
			if (currentStats.topPated[patSource.src] === undefined) { currentStats.topPated[patSource.src] = {type: null, count: 0}; }
			currentStats.topPated[patSource.src].type = patSource.type;
			currentStats.topPated[patSource.src].count = currentStats.topPated[patSource.src].count + 1;
		}	
		
		log(allStats);
		await Settings.set("UserStats", allStats);
	}
}