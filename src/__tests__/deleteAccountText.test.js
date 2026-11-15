import { describe, expect, test } from 'vitest';

import genLocales from '../models/locales';

describe('delete account text', () => {
  const { en, es } = genLocales().settingsProfile;

  test('both languages say what is kept and that it cannot be undone', () => {
    expect(en.confirmDeleteMessage).toMatch(/keeps your rider profile/);
    expect(en.confirmDeleteMessage).toMatch(/your rides/);
    expect(en.confirmDeleteMessage).toMatch(/planned trips/);
    expect(en.confirmDeleteMessage).toMatch(/cannot be undone/);
    expect(es.confirmDeleteMessage).toMatch(/conserva tu perfil de pasajero/);
    expect(es.confirmDeleteMessage).toMatch(/no se puede deshacer/);
  });
});

describe('privacy contact', () => {
  test('the privacy text uses the support address, not the placeholder', () => {
    const { en } = genLocales().settingsPrivacy;
    expect(en.content).toContain('support@etchgis.com');
    expect(en.content).not.toContain('example.com');
  });
});
