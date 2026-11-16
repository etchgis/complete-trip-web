// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';

import { requestErrorMessage } from '../components/VerticalTripPlan/ShuttleSummonModal';

const t = key => `t:${key}`;

describe('requestErrorMessage', () => {
  test('shows the gate refusal text as is', () => {
    const e = Object.assign(new Error('The shuttle is closed today'), { code: 'SERVICE_CLOSED' });
    expect(requestErrorMessage(t, e)).toBe('The shuttle is closed today');
  });

  test('still maps other failures to the generic text', () => {
    expect(requestErrorMessage(t, new Error('boom'))).toBe('t:tripWizard.popUpUnknownError');
    expect(requestErrorMessage(t, new Error('invalid pin'))).toBe('t:tripWizard.popUpError');
  });
});
