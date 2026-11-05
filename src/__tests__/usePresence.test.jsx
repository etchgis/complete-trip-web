// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import usePresence from '../hooks/usePresence';
import config from '../config';

const verdict = vi.fn();
const timeline = vi.fn();
const rides = vi.fn();
const publicStatus = vi.fn();

vi.mock('../services/transport/presence', () => ({
  default: {
    verdict: (...a) => verdict(...a),
    timeline: (...a) => timeline(...a),
    rides: (...a) => rides(...a),
    publicStatus: (...a) => publicStatus(...a),
  },
}));

const options = (overrides = {}) => ({
  enabled: true,
  vehicleId: 'v1',
  timeZone: 'America/New_York',
  getToken: () => 'tok',
  ...overrides,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('the presence flag', () => {
  test('is off by default', () => {
    expect(config.PRESENCE.enabled).toBe(false);
  });

  test('asks the service nothing when the hook is disabled', async () => {
    renderHook(() => usePresence(options({ enabled: false })));
    await Promise.resolve();
    expect(verdict).not.toHaveBeenCalled();
    expect(timeline).not.toHaveBeenCalled();
  });
});

describe('usePresence', () => {
  test('reads only the anonymous status when not signed in', async () => {
    publicStatus.mockResolvedValue({ state: 'not_live', reason: 'silent', evaluatedAt: Date.now() });
    const { result } = renderHook(() => usePresence(options({ getToken: () => null })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(publicStatus).toHaveBeenCalledWith('v1');
    expect(verdict).not.toHaveBeenCalled();
    expect(timeline).not.toHaveBeenCalled();
    expect(rides).not.toHaveBeenCalled();
    expect(result.current.signedIn).toBe(false);
    expect(result.current.verdict.state).toBe('not_live');
  });

  test('reads each answer on its own so one failure leaves the rest', async () => {
    verdict.mockResolvedValue({ state: 'live', evaluatedAt: Date.now() });
    timeline.mockRejectedValue(new Error('down'));
    rides.mockResolvedValue({ rides: [] });
    const { result } = renderHook(() => usePresence(options()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.verdict.state).toBe('live');
    expect(result.current.timeline).toBeNull();
    expect(result.current.rides).toEqual([]);
  });

  test('sends the signed in agent token', async () => {
    verdict.mockResolvedValue(null);
    timeline.mockResolvedValue(null);
    rides.mockResolvedValue(null);
    renderHook(() => usePresence(options({ getToken: () => 'tok' })));
    await waitFor(() => expect(verdict).toHaveBeenCalled());
    expect(verdict.mock.calls[0]).toEqual(['v1', 'tok']);
  });
});
