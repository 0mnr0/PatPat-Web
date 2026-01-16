const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
const BrowserContext = isFirefox ? browser : chrome;
const ExtensionVersion = BrowserContext.runtime.getManifest().version;
const log = console.log;


const Settings = {
	  get(key, defValue) {
		return new Promise(resolve => {
		  chrome.storage.local.get(key, res => {
			if (res[key] === undefined) {resolve(defValue); return}
			resolve(res[key]);
		  });
		});
	  },

	  set(key, value) {
		return new Promise(resolve => {
		  chrome.storage.local.set({ [key]: value }, resolve);
		});
	  },

	  delete(key) {
		return new Promise(resolve => {
		  chrome.storage.local.remove(key, resolve);
		});
	  },

	  clear() {
		return new Promise(resolve => {
		  chrome.storage.local.clear(resolve);
		});
	  },

	  async isKeyExists(key) {
		return new Promise(resolve => {
		  chrome.storage.local.get(key, res => {
			resolve(Object.prototype.hasOwnProperty.call(res, key));
		  });
		});
	  },
	  
	  getAll() {
		return new Promise(resolve => {
		  chrome.storage.local.get(null, res => {
			resolve(res);
		  });
		});
	  } 
	};



async function loadPacks() {
  const url = chrome.runtime.getURL("etc/packs.json");
  const response = await fetch(url);
  const data = await response.json();
  return data
}

const DefaultValues = {
	AllowSound: true,
	IgnoreSites: [],
	PatSpeed: 1,
	PatVolume: 50,
	SelectedPack: "PatPat Classic",
	ShowImages: true,
	ForceDithering: false,
	EnableDithering: false,
	EnableSuperFeatures: false,
	"MakeAnnouncements.Ext": true
};

















async function SetupDefault () {
	const BuiltinPacks = await loadPacks();
	const UserSettings = await Settings.getAll();
	
	const DefaultValuesKeys = Object.keys(DefaultValues);
	for (let i = 0; i < DefaultValuesKeys.length; i++) {
		const key = DefaultValuesKeys[i]
		if (await Settings.isKeyExists(key) === false) {
			await Settings.set(key, DefaultValues[key])
		}
	}
	
}
SetupDefault();





chrome.storage.onChanged.addListener(async (changes) => {
  const tabs = await chrome.tabs.query({});
  await SetupDefault();
  
  
  for (const tab of tabs) {
    if (!tab.id) {log('p!'); };

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "PatPat.events.SettingsChange"
      });
    } catch(e) {
		log(e)
    }
  }
});














// After DOM Loader

chrome.runtime.onInstalled.addListener(async () => {
	
  const oldScripts = await chrome.scripting.getRegisteredContentScripts();
  if (oldScripts.length > 0) {
    await chrome.scripting.unregisterContentScripts();
  }

  await chrome.scripting.registerContentScripts([{
    id: "early-injector",
    js: ["code/LightCore.js", "code/rules.js", "code/tools.js", "code/main.js", "code/page_init.js", "code/SuperFeatures.js", "code/stats.js"],
    matches: [
			"<all_urls>",
			"file:///*",
			"http://localhost/*",
			"http://127.0.0.1/*"
		],
    runAt: "document_start",
    persistAcrossSessions: true
  }]);
  
  
});