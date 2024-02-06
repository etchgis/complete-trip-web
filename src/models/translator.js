import { useEffect, useState } from 'react';

import { I18n } from 'i18n-js';
// import es from './es.json';
import genLocales from './locales.js';

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

const module = {
  t: (key, config) => i18n.t(key, config),

  configure: languageTag => {
    i18n.locale = languageTag;
  },
};

export default module;
