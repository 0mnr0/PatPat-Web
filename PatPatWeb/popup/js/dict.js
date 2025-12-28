const DICT = {
	'en': {
		'GeneralSettings': "General Settings",
		'BlockList': "Black List",
		'AllowSound': 'Allow sounds',
		'PatVolume': 'Volume: ',
		'ShowImages': 'Show Image',
		'ShowImagesDescription': 'Specify whether to show images (Default is Hand)',
		'DataSet': 'Data Set',
		'UploadDatapack': 'Upload Datapack',
		'DataPackProcessing': 'Processing...',
	},
	'ru': {
		'GeneralSettings': "Настройки",
		'BlockList': "Черный список",
		'AllowSound': 'Разрешить звуки',
		'PatVolume': 'Громкость: ',
		'ShowImages': 'Показывать изображение',
		'ShowImagesDescription': 'Укажите, стоит ли показывать изображения',
		'DataSet': 'Набор данных',
		'UploadDatapack': 'Загрузить набор данных',
		'DataPackProcessing': 'Обработка...',
	},
	"by": "ru"
}



TranslateAssistant.init('en', DICT);
const lang = navigator.language;
const LoadLanguage =
  TranslateAssistant.isLangAvailable(lang) ? lang : 'en';

TranslateAssistant.defaultLocale(LoadLanguage);
