import genLocales from '../../../src/models/locales.js';

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

describe('Checks that english and spanish objects exist', () => {
  it('English and Spanish objects exist', () => {
    const languages = generateLanguages(genLocales());
    expect(languages.en).to.exist;
    expect(languages.es).to.exist;
  });
});

describe('Checks that all english keys have spanish translations', () => {
  it('All English keys have Spanish translations', () => {
    const languages = generateLanguages(genLocales());
    const english = languages.en;
    const spanish = languages.es;
    const missing = [];
    Object.keys(english).forEach(key => {
      if (!spanish[key]) {
        missing.push(key);
      }
    });
    console.log(missing);
    expect(missing.length).to.equal(0);
  });
});

describe('Checks that all spanish keys have english translations', () => {
  it('All Spanish keys have English translations', () => {
    const languages = generateLanguages(genLocales());
    const english = languages.en;
    const spanish = languages.es;
    const missing = [];
    Object.keys(spanish).forEach(key => {
      if (!english[key]) {
        missing.push(key);
      }
    });
    console.log(missing);
    expect(missing.length).to.equal(0);
  });
});
