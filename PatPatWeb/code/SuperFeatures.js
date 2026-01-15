let FeaturesStorageRoom = {} // for saving temp data

const SuperFeaturesData = {
	'reddit.com': {
		patActivated: 0, //counter
		patActivationCount: 12, //condition
		func: (patElement) => {
			let RedditPost = patElement.closest('shreddit-post'); if (!RedditPost) {return}
			let UpvoteImage = RedditPost.shadowRoot.querySelector('svg[icon-name="upvote"]');
			
			if (UpvoteImage) {UpvoteImage.closest('button').click();}
		}
	}
}


function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  const copy = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}


const SuperFeatures = {		
	getElementId: (site, element) => {
		if (!element.dataset.patPatWebExtensionSPF) {
			element.dataset.patPatWebExtensionSPF = crypto.randomUUID();
		}
		return `${site}.${element.dataset.patPatWebExtensionSPF}`;
	},
	
	getRoom: (site, element) => {
		let elementId = SuperFeatures.getElementId(site, element);
		
		if (FeaturesStorageRoom[elementId] === undefined) {
			FeaturesStorageRoom[elementId] = deepClone(SuperFeaturesData[site]);
		}
		return FeaturesStorageRoom[elementId];
	},
	
	supporting: (site) => {
		return Object.keys(FeaturesStorageRoom).includes(site);
	},
	
	run: (element) => {
		if (!WorkAllowedOnThisSite) {return}
		if (!UserSettings.EnableSuperFeatures) {return}
		
		const siteDomain = getSiteDomainName().replace('www.','');
		if (!SuperFeatures.supporting(siteDomain)) {log('site is not supported'); return}
		const room = SuperFeatures.getRoom(siteDomain, element);
		room.patActivated++;
		
		
		if (room.patActivated >= room.patActivationCount) {
			room.func(element);
		}
	},
}




// init storage
for (siteDomain in SuperFeaturesData) {
	FeaturesStorageRoom[siteDomain] = {}
}