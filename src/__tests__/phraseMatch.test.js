import { describe, expect, test } from 'vitest';

import { phraseMatches } from '../utils/phraseMatch';
import genLocales from '../models/locales';

describe('phraseMatches', () => {
  test('ignores case, outer spaces, and accents', () => {
    expect(phraseMatches('  delete my account ', 'DELETE MY ACCOUNT')).toBe(true);
    expect(phraseMatches('eliminar mi cuenta', 'ELIMINAR MI CUENTA')).toBe(true);
    expect(phraseMatches('ELIMINÁR MI CUENTA', 'ELIMINAR MI CUENTA')).toBe(true);
    expect(phraseMatches('eliminar mi cuenta', 'ELIMINÁR MI CUENTA')).toBe(true);
  });

  test('rejects a different phrase', () => {
    expect(phraseMatches('delete my accounts', 'DELETE MY ACCOUNT')).toBe(false);
    expect(phraseMatches('DELETE MY ACCOUNT', 'ELIMINAR MI CUENTA')).toBe(false);
    expect(phraseMatches('', 'DELETE MY ACCOUNT')).toBe(false);
  });

  test('each language has its own phrase', () => {
    const { en, es } = genLocales().settingsProfile;
    expect(en.deletePhrase).toBe('DELETE MY ACCOUNT');
    expect(es.deletePhrase).toBe('ELIMINAR MI CUENTA');
  });
});
