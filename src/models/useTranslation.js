import { useEffect, useState } from 'react';

import { I18n } from 'i18n-js';
// import es from './es.json';
import genLocales from './locales.js';
import { set } from 'lodash';
import { useStore } from '../context/RootStore.jsx';

/**
 * The configuration object is passed to the I18n constructor
 * It is structured as a shallow object with keys that are pages or views, then the language, then the key-value pairs of the translations
 * @param {Object} configObject
 * @returns
 */
const generateLanguages = configObject => {
  const languages = {};
  Object.keys(configObject).forEach(key => {
    Object.keys(configObject[key]).forEach(language => {
      if (!languages[language]) {
        languages[language] = {};
      }
    });
  });

  Object.keys(languages).forEach(language => {
    Object.keys(configObject).forEach(key => {
      languages[language][key] = configObject[key][language];
    });
  });
  return languages;
};

const languages = generateLanguages(genLocales());

console.log('languages', languages);

// const module = {
//   t: (key, config) => i18n.t(key, config),

//   configure: languageTag => {
//     i18n.locale = languageTag;
//   },
// };

// export default module;

const useTranslation = () => {
  const { ui } = useStore().uiStore;
  const i18n = new I18n({
    en: languages.en,
    es: languages.es,
    fallbacks: true,
    defaultLocale: 'en',
    locale: 'en',
    // missingTranslation: (scope, options) => {
    //   console.log('missing translation', scope);
    // },
  });

  const [translator, setTranslator] = useState(() => ({
    t: (key, config) => i18n.t(key, config),
  }));

  const configure = languageTag => {
    i18n.locale = languageTag;
    setTranslator({
      t: (key, config) => i18n.t(key, config),
    });
  };

  useEffect(() => {
    if (!ui?.language) return;
    console.log('configuring language', ui?.language);
    configure(ui?.language);
  }, [ui]);

  // useEffect(() => {
  //   console.log(JSON.stringify(ui, null, 2));
  //   if (!ui.language) return;
  //   setTranslator({
  //     t: (key, config) => i18n.t(key, config),
  //     configure: languageTag => {
  //       i18n.locale = ui?.language || languageTag || 'en';
  //     },
  //   });
  // }, [ui]);

  return { t: translator?.t, configure, translator };
};

export default useTranslation;
