const DICT = {
	'en': {
		'GeneralSettings': "General Settings",
		'BlockList': "Black List",
		'AllowSound': 'Allow sounds',
		'PatSpeed': 'Animation Duration: ',
		'PatVolume': 'Volume: ',
		'ShowImages': 'Show Image',
		'ShowImagesDescription': 'Specify whether to show images (Default is Hand)',
		'DataSet': 'Data Set',
		'UploadDatapack': 'Upload ResoursePack',
		'DataPackProcessing': 'Processing...',
		'DataPackDescription': 'Upload it .A zip resource pack developed for PatPat. (Not all are supported)',
		'SpecifyCorrectDomainName': 'Please specify the correct domain name',
		'SiteIsAlreadyIgnoring': 'The site is already on the ignored list',
		'BlockList.ReloadPageToApply': 'Reload the necessary pages to apply the rules',
		'BlockListSetting': 'Ignore websites',
		'MakeAnnouncements.Ext': 'Web Events',
		'MakeAnnouncements.Ext.Desc': 'If the site supports this extension, it will be able to receive Pat events when interacting with the site and perform any actions',
		'OtherTab': 'Other',
		'AllowContextMenu': 'Context Menu',
		'AllowContextMenu.Desc': 'Show "Pat IT!" in context menu',
		
		
		'EnableDithering': 'Adaptive transparency',
		'ForceDithering': 'Always',
		'EnableDithering': 'When an extension creates an animation that takes up a lot of screen space, a transparency filter is applied to it',
		'ForceDithering': 'Always create animations with transparency effect',
		'EnableSuperFeatures': 'Super Functions',
		'EnableSuperFeatures.Desc': 'Enables "Super Features" on supported sites. For example, on Reddit, after patting one photo 10 times, an UpVote is set',
		
		
		'unpacker.sounds.json_isNotExtists': `File "sounds.json" is not found :(`,
		'unpacker.textures.json5_isNotExtists': `Texture config is not found :(`,
		'unpacker.textures.isNotExtists': `Failed to find or parse textures :(`,
		'unpacker.status.ok': `Resourse Pack is loaded! :)`,
		'delete': `Delete`,
		
		'howmanysounds': `Sounds: `,
		'howmanyimages': `Images: `,
		'howlong': `Length: `,
		'PackAuthor': `Author: `,
		'AuthorsTab': 'Authors',
		
		'LopyMineDesc': `The developers of the "PatPat" mod for Minecraft became the idea for this expansion. Thanks guys for the resources provided for the expansion`,
		'dsvl0Desc': `Actually I am. (The one who wrote the extension)`,
		
	},
	'ru': {
		'GeneralSettings': "Настройки",
		'BlockList': "Черный список",
		'AllowSound': 'Разрешить звуки',
		'PatSpeed': 'Длительность анимации: ',
		'PatVolume': 'Громкость: ',
		'ShowImages': 'Показывать изображение',
		'ShowImagesDescription': 'Укажите, стоит ли показывать изображения',
		'DataSet': 'Набор данных',
		'UploadDatapack': 'Загрузить набор данных',
		'DataPackProcessing': 'Обработка...',
		'DataPackDescription': 'Загружайте .zip ресурспаки, разработанные для PatPat. (Поддерживаются не все)',	
		'SpecifyCorrectDomainName': 'Пожалуйста укажите правильное доменное имя',
		'SiteIsAlreadyIgnoring': 'Сайт уже находится в списке игнорируемых',
		'BlockList.ReloadPageToApply': 'Перезагрузите нужные страницы чтобы применить правила',
		'BlockListSetting': 'Игнорировать сайты',
		'MakeAnnouncements.Ext': 'События на сайтах',
		'MakeAnnouncements.Ext.Desc': 'Если сайт поддерживает это расширение, оно сможет получать Pat события при взаимодействии с сайтом и выполнять какие-либо действия',
		'OtherTab': 'Другое',
		'AllowContextMenu': 'Контексное меню',
		'AllowContextMenu.Desc': 'Показывать "Pat IT!" в контекстном меню',
		
		'EnableDithering': 'Адаптивная прозрачность',
		'ForceDithering': 'Всегда',
		'EnableDithering.Desc': 'Когда расширение создает анимацию, которое занимает много места на экране, к нему примениться фильтр прозрачности',
		'ForceDithering.Desc': 'Всегда создавать анимацию с эффектом прозрачности',
		'EnableSuperFeatures': 'Включить СуперФункции',
		'EnableSuperFeatures.Desc': 'Включает "Супер Функции" на поддерживаемых сайтах. Например, на Reddit, после похлопывания одного фото 10 раз - ставиться Upvote',
		
		
		'unpacker.sounds.json_isNotExtists': `Файл "sounds.json" не найден :(`,
		'unpacker.textures.json5_isNotExtists': `Конфиг текстур не найден :(`,
		'unpacker.textures.isNotExtists': `Не удалось найти текстуры :(`,
		'unpacker.status.ok': `Пакет данных установлен! :)`,
		'delete': `Удалить`,
		
		'howmanysounds': `Звуков: `,
		'howmanyimages': `Изображений: `,
		'howlong': `Длина: `,
		'PackAuthor': `Автор: `,
		'AuthorsTab': 'Авторы',
		
		'LopyMineDesc': `Разработчики мода "PatPat" для Minecraft, стала идеей для этого расширения. Спасибо ребятам, за ресурсы, предоставленные для расширения.`,
		'dsvl0Desc': `Собственно я (Тот кто написал расширение)`,
	},
	"ru-RU": "ru"
}



const lang = navigator.language;
const LoadLanguage =
    TranslateAssistant.isLangIncluded(DICT, lang) ? lang : 'en';
	
TranslateAssistant.init(LoadLanguage, DICT);
