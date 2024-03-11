import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pl from "./translations/pl.json";
import en from "./translations/en.json";
import intervalPlural from 'i18next-intervalplural-postprocessor';

i18n
  .use(intervalPlural)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    debug: false,
    compatibilityJSON: "v3",
    resources: {
      pl: pl,
      en: en,
    },
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
