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

// Every string a screen can ask for, as a dotted path such as
// "shuttleStatus.ageMinutes.one".
const leafKeys = (value, path = '') => {
  if (value === null || typeof value !== 'object') return [path];
  return Object.keys(value).flatMap(key =>
    leafKeys(value[key], path ? `${path}.${key}` : key)
  );
};

// The value at a dotted path, or undefined when the path does not exist.
const valueAt = (value, path) =>
  path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), value);

// A string that is empty or only spaces shows the rider a blank, so it counts
// as missing rather than as a translation.
const isBlank = value => typeof value !== 'string' || value.trim() === '';

const translatedKeys = strings =>
  leafKeys(strings).filter(key => !isBlank(valueAt(strings, key)));

const missingFrom = (source, target) => {
  const present = new Set(translatedKeys(target));
  return leafKeys(source).filter(key => !present.has(key));
};

// Strings that are known to exist in only one language. The consent form is a
// research consent document approved by a review board, so its Spanish text has
// to come from a professional translation rather than from a developer. The
// Spanish terms keys belong to a layout the English screen does not use.
// Anything not listed here must exist in both languages.
const KNOWN_ENGLISH_ONLY = [
  'loginWizard.consent.title',
  'loginWizard.consent.header',
  'loginWizard.consent.headerText',
  'loginWizard.consent.info1',
  'loginWizard.consent.info1Text',
  'loginWizard.consent.q1',
  'loginWizard.consent.a1',
  'loginWizard.consent.q2',
  'loginWizard.consent.a2a',
  'loginWizard.consent.a2b',
  'loginWizard.consent.a2c',
  'loginWizard.consent.a2d',
  'loginWizard.consent.a2e',
  'loginWizard.consent.q3',
  'loginWizard.consent.a3',
  'loginWizard.consent.q4',
  'loginWizard.consent.a4',
  'loginWizard.consent.q5',
  'loginWizard.consent.a5',
  'loginWizard.consent.q6',
  'loginWizard.consent.a6',
  'loginWizard.consent.q7',
  'loginWizard.consent.a7',
  'loginWizard.consent.info2',
  'loginWizard.consent.info2Text',
  'loginWizard.consent.q8',
  'loginWizard.consent.a8a',
  'loginWizard.consent.a8b',
  'loginWizard.consent.a8c',
  'loginWizard.consent.a8d',
  'loginWizard.consent.a8e',
  'loginWizard.consent.a8f',
  'loginWizard.consent.q9',
  'loginWizard.consent.a9',
  'loginWizard.consent.q10',
  'loginWizard.consent.a10',
  'loginWizard.consent.q11',
  'loginWizard.consent.a11',
  'loginWizard.consent.q12',
  'loginWizard.consent.a12',
  'loginWizard.consent.q13',
  'loginWizard.consent.a13',
  'loginWizard.consent.q14',
  'loginWizard.consent.a14',
  'loginWizard.consent.q15',
  'loginWizard.consent.q15q1',
  'loginWizard.consent.q15a1',
  'loginWizard.consent.q15q2',
  'loginWizard.consent.q15a2',
  'loginWizard.consent.confirm',
];

const KNOWN_SPANISH_ONLY = [
  'loginWizard.termsTitle',
  'loginWizard.termsText',
  'loginWizard.changesToTermsLong',
  'loginWizard.changesToTermsTextLong',
];

describe('Checks that english and spanish objects exist', () => {
  it('English and Spanish objects exist', () => {
    const languages = generateLanguages(genLocales());
    expect(languages.en).to.exist;
    expect(languages.es).to.exist;
  });
});

describe('Checks that no string is blank', () => {
  it('Every English and Spanish string has text', () => {
    const { en, es } = generateLanguages(genLocales());
    const blankEnglish = leafKeys(en).filter(
      key => isBlank(valueAt(en, key)) && KNOWN_SPANISH_ONLY.indexOf(key) === -1
    );
    const blankSpanish = leafKeys(es).filter(
      key => isBlank(valueAt(es, key)) && KNOWN_ENGLISH_ONLY.indexOf(key) === -1
    );
    expect(blankEnglish).to.deep.equal([]);
    expect(blankSpanish).to.deep.equal([]);
  });
});

describe('Checks that all english keys have spanish translations', () => {
  it('Every English string has a Spanish string at the same path', () => {
    const { en, es } = generateLanguages(genLocales());
    const missing = missingFrom(en, es).filter(
      key => KNOWN_ENGLISH_ONLY.indexOf(key) === -1
    );
    expect(missing).to.deep.equal([]);
  });

  it('Every string listed as English only is still missing in Spanish', () => {
    // Keeps the list honest: once a translation lands, its entry has to go.
    const { en, es } = generateLanguages(genLocales());
    const missing = missingFrom(en, es);
    expect(KNOWN_ENGLISH_ONLY.filter(key => missing.indexOf(key) === -1)).to
      .deep.equal([]);
  });
});

describe('Checks that all spanish keys have english translations', () => {
  it('Every Spanish string has an English string at the same path', () => {
    const { en, es } = generateLanguages(genLocales());
    const missing = missingFrom(es, en).filter(
      key => KNOWN_SPANISH_ONLY.indexOf(key) === -1
    );
    expect(missing).to.deep.equal([]);
  });

  it('Every string listed as Spanish only is still missing in English', () => {
    const { en, es } = generateLanguages(genLocales());
    const missing = missingFrom(es, en);
    expect(KNOWN_SPANISH_ONLY.filter(key => missing.indexOf(key) === -1)).to
      .deep.equal([]);
  });
});
