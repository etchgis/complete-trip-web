// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';

import { requestErrorMessage } from '../components/VerticalTripPlan/ShuttleSummonModal';

const t = key => `t:${key}`;

describe('requestErrorMessage', () => {
  test('shows the gate refusal text as is', () => {
    const e = Object.assign(new Error('The shuttle is closed today'), { code: 'SERVICE_CLOSED' });
    expect(requestErrorMessage(t, e)).toBe('The shuttle is closed today');
  });

  test('shows the too many tries text for a 429 answer', () => {
    const e = Object.assign(new Error('Too many tries. Please wait, then try again.'), { status: 429 });
    expect(requestErrorMessage(t, e)).toBe('t:tripWizard.popUpTooManyTries');
  });

  test('has the too many tries text in both languages', async () => {
    const { default: genLocales } = await import('../models/locales');
    const text = JSON.stringify(genLocales());
    expect(text).toContain('Too many tries. Please wait and try again later.');
    expect(text).toContain('Demasiados intentos.');
  });

  test('still maps other failures to the generic text', () => {
    expect(requestErrorMessage(t, new Error('boom'))).toBe('t:tripWizard.popUpUnknownError');
    expect(requestErrorMessage(t, new Error('invalid pin'))).toBe('t:tripWizard.popUpError');
  });
});
