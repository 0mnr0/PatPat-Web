const DICT = {
	'en': {
		"OK": "OK",
		"FINE": "Fine",
		"Recorder.MemeIsGenerating.Text": "Rendering a file",
		"Recorder.MemeIsGenerating.Button": "Cancel",
		"Recorder.MemeIsGenerating.Canceled": "Meme generation canceled!",
		"Recorder.Export.Error": "We're sorry, there was an error during export!",
		
		
		"Recorder.Downloading.Text": "Downloading",
		"Recorder.Done.Text": "Done!",
		
		"PatPat.Error.DataPackIsNotFound.Part1": `We couldn't load "`,
		"PatPat.Error.DataPackIsNotFound.Part2": `" datapack into PatPat :(. Please choose another one and reload the page.`,
	},
	'ru': {
		"OK": "Хорошо",
		"FINE": "Понятно",
		"Recorder.MemeIsGenerating.Text": "Создаём анимированную картинку",
		"Recorder.MemeIsGenerating.Button": "Отмена",
		"Recorder.MemeIsGenerating.Canceled": "Создание картинки было отменено!",
		"Recorder.Export.Error": "Приносим извенения, при экспорте что то пошло не так :(",
		
		"Recorder.Downloading.Text": "Скачивание...",
		"Recorder.Done.Text": "Готово!",
		
		"PatPat.Error.DataPackIsNotFound.Part1": `Мы не смогли найти надор данных "`,
		"PatPat.Error.DataPackIsNotFound.Part2": `" и загрузить его в PatPat :(. Пожалуйста, выерите другой и перезагрузите страницу.`,
	},
	"ru-RU": "ru"
}


const lang = navigator.language;
const LoadLanguage =
    TranslateAssistant.isLangIncluded(DICT, lang) ? lang : 'en';
	
	
TranslateAssistant.init(LoadLanguage, DICT);
const Translate = TranslateAssistant.translate.get;