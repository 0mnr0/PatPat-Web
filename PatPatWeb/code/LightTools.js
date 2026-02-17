const find = function(selector) { return document.querySelector(selector) };
const findAll = function(selector) { return document.querySelectorAll(selector) };
const findById = function(selector) { return document.getElementById(selector) };
const HTML = document.documentElement;
const body = document.body;
const head = document.head;
const print = console.log;	
const log = console.log;	
const warn = console.warn;	
const sleep = ms => new Promise(res => setTimeout(res, ms));
const random = (min, max) => {
    min = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
}




let defaultLocale = navigator.language;
let TrDict = {};
let CopiedLngs = [];
const TranslateAssistant = {

	"init": function(baseLang, dict) {
		CopiedLngs = [];
        if (typeof baseLang !== 'string') {
            throw "You need to specify \"baseLang\" key (example: 'en' | 'ru')"
        }
        if (typeof dict !== 'object') {
            throw "You need to specify translate \"dictionary\"!"
        }
        defaultLocale = baseLang;
        TrDict = structuredClone(dict);

        for (let [lang, val] of Object.entries(TrDict)) {
            if (typeof val === "string" && TrDict[val]) {
                TrDict[lang] = TrDict[val];
				CopiedLngs.push(lang);					
            }
        }
			
    },

    isLangAvailable: (lang) => { // Checking laungage support in loaded dict
        return Object.keys(TrDict).includes(lang)
    },

    isLangIncluded: (inputDict, lang) => { // Check laungage support in dict
        return Object.keys(inputDict).includes(lang)
    },

    defaultLocale: function(baseLang){
        if (typeof baseLang === 'string') {
            defaultLocale = baseLang;
        }
        return defaultLocale;
    },

    dict: function(dictionary) {
        if (typeof dictionary === 'object') {
            TrDict = dictionary;
        }
        return TrDict;
    },
		
	getAvailableLanguages: () => {
		return Object.keys(TrDict).filter(lang => !CopiedLngs.includes(lang) && lang !== "NOT_TRANSLATEABLE");
	},

    translate: {
        get: function(key) {
            if (TrDict["NOT_TRANSLATEABLE"]?.[key] !== undefined) {
                return TrDict["NOT_TRANSLATEABLE"][key]
            }
            return TrDict[defaultLocale]?.[key] || key
        },
        all: function() {
            const elements = document.querySelectorAll('*[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute("data-i18n");
                const translation = TranslateAssistant.translate.get(key);

                if (translation) {
                    const textNode = [...el.childNodes].find(
                        node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ""
                    );
                    if (textNode) {
                        textNode.nodeValue = translation;
                    } else {
                        el.insertBefore(document.createTextNode(translation), el.firstChild);
                    }
                }
            });
        },
        key: function(key) {
            if (key === undefined) {return TrDict}
            return TranslateAssistant.translate.get(key)
        }
    }
};
TranslateAssistant.translate.getString = TranslateAssistant.translate.get;