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
	AllowContextMenu: true,
	ForceDithering: false,
	EnableDithering: false,
	EnableSuperFeatures: false,
	IgnoreSites: [],
	PatSpeed: 1,
	PatVolume: 50,
	SelectedPack: "PatPat Classic",
	ShowImages: true,
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
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "PatPat.events.SettingsChange"
      });
    } catch(e) {
		log(e)
    }
  }
});




BrowserContext.runtime.onInstalled.addListener(() => {
    BrowserContext.contextMenus.create({
        id: "PatPat.It.Item",
        title: "Pat It!",
        contexts: ["image", "video"]
    });
});

BrowserContext.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "PatPat.It.Item") {
        BrowserContext.tabs.sendMessage(tab.id, {
            type: "PatPat.It.Item"
        });
    }
});
