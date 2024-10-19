const translation = {
    en: {
        selct : "Select a Language",
        title : "Gesture Chat",
        paragr : "A New Way to Navigate the Web"

    },

    es: {
        selct : "Seleccione un Idioma",
        title : "Chat de Gestos",
        paragr : "Una Nueva Forma de Navegar por la Web"

    }


}

const languageSelectop = document.querySelector("select");
let h1 = document.getElementById("h1");
let tittle = document.getElementById("tittle");
let par = document.getElementById("par");

languageSelectop.addEventListener("change", (event) => {
    setLanguage(event.target.value)
})

const setLanguage = (language) => {
    if(language == "es"){
        h1.innerText = translations.es.selct;
        tittle.innerText = translations.es.title;
        par.innerText = translations.es.paragr;
    }else if(language == "en"){
        h1.innerText = translations.en.selct;
        tittle.innerText = translations.en.title;
        par.innerText = translations.en.paragr;
    }
}