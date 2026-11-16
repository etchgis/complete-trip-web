import { describe, expect, test, vi } from 'vitest';

import Preferences from '../context/Preferences';

const storeWith = profile => {
  const updateUserProfile = vi.fn();
  const rootStore = { authentication: { user: { profile }, updateUserProfile } };
  return { preferences: new Preferences(rootStore), updateUserProfile };
};

const saved = updateUserProfile => updateUserProfile.mock.calls[0][0];

describe('saving a notification switch', () => {
  test('keeps the stored booking PIN and the other profile fields', () => {
    const { preferences, updateUserProfile } = storeWith({
      firstName: 'Pat',
      clientId: '77',
      preferences: { pin: '4821', notifications: ['sms'], customSetting: 'x' },
    });
    preferences.hydrate({ preferences: { pin: '4821', notifications: ['sms'] } });
    preferences.addNotification('email');
    const profile = saved(updateUserProfile);
    expect(profile.firstName).toBe('Pat');
    expect(profile.clientId).toBe('77');
    expect(profile.preferences.pin).toBe('4821');
    expect(profile.preferences.customSetting).toBe('x');
    expect(profile.preferences.notifications).toEqual(['sms', 'email']);
  });

  test('keeps the PIN when removing a notification type', () => {
    const { preferences, updateUserProfile } = storeWith({ preferences: { pin: '0007' } });
    preferences.removeNotificationType(['tripScheduled']);
    expect(saved(updateUserProfile).preferences.pin).toBe('0007');
  });

  test('sends no pin when the profile has none', () => {
    const { preferences, updateUserProfile } = storeWith({ preferences: {} });
    preferences.addNotification('sms');
    expect('pin' in saved(updateUserProfile).preferences).toBe(false);
  });
});
