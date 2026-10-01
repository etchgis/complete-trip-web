import config from '../../config';

const authentication = {
  refreshAccessToken(refreshToken) {
    return fetch(`${config.SERVICES.auth.url}/accessToken`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got refresh token response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },

  login(email, password, source) {
    const _source = source || 'web';
    return fetch(`${config.SERVICES.auth.url}/login?source=${_source}`, {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got login response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        console.log({ json });
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  get(accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  refreshUser(accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got refresh user response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        console.log({ json });
        throw json?.error;
      })
      .catch(err => {
        throw err;
      });
  },

  register(email, phone, organization, password, profile) {
    console.log(`\n----------\n{services-transport-auth} registering user`);
    console.log({ email, phone, organization, password, profile });
    console.log(`\n----------\n{services-transport-auth} registering user`);

    return fetch(`${config.SERVICES.auth.url}/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase(),
        phone,
        password,
        profile,
        role: 'rider',
        organization,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('got register response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error;
      })
      .catch(err => {
        throw err;
      });
  },

  verify(channel, to) {
    var data = {
      channel,
      to,
      sid: config.VERIFY.SID,
    };
    if (channel === 'email') {
      data.channelConfiguration = config.VERIFY.CHANNEL_CONFIGURATION;
      data.to = data.to.toLowerCase();
    } else if (channel === 'sms' && !to.startsWith('+')) {
      data.to = `+${to}`;
    }
    return fetch(`${config.SERVICES.auth.url}/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  confirm(sid, to, code) {
    console.log({ sid, to, code });
    return fetch(`${config.SERVICES.auth.url}/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        sid,
        to: to.toLowerCase(),
        code,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  update(profile, accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'PATCH',
      body: JSON.stringify(profile),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got patch auth response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error;
      })
      .catch(err => {
        throw err;
      });
  },

  activate(token) {
    return fetch(`${config.SERVICES.verifications.url}/codes/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.verifications.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got auth activate response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error;
      })
      .catch(err => {
        throw err;
      });
  },

  registerDevice(identity, address, bindingType, accessToken) {
    console.log(
      `{services-transport-auth} registering device with ID ${identity}`
    );
    return fetch(`${config.SERVICES.auth.url}/devices`, {
      method: 'POST',
      body: JSON.stringify({
        identity,
        address,
        bindingType,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('got register device response');
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error;
      })
      .catch(err => {
        console.log('{services-transport-auth} registration failed');
        throw err;
      });
  },

  removeDeviceIfRegistered(identity, accessToken) {
    console.log(
      `{services-transport-auth} deleting ${config.SERVICES.auth.url}/devices/${identity}`
    );
    return fetch(`${config.SERVICES.auth.url}/devices/${identity}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('{services-transport-auth} got remove device response');
        if (response.status === 400) {
          // this will be returned if the sid wasn't found.
          console.log('this device was not registered.');
          return null;
        }
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        console.warn('removeDeviceIfRegistered', json?.error);
        return null;
      })
      .catch(err => {
        console.warn('removeDeviceIfRegistered', err);
        return null;
      });
  },

  updatePassword(oldPassword, password, accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'PATCH',
      body: JSON.stringify({ oldPassword, password }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  updatePhone(phone, accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'PATCH',
      body: JSON.stringify({ phone }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  delete(accessToken) {
    return fetch(`${config.SERVICES.auth.url}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        if (response.status === 200) {
          return true;
        }
        throw new Error({ message: 'Unknown error deleting user' });
      })
      .catch(err => {
        throw err;
      });
  },

  /**
   * Asks the auth service to send a password reset code.
   * @param {String} email
   * @param {'sms'|'call'|'email'} mfa
   * @returns {Promise<{concealed?: String}>} concealed is the masked address
   * the code was sent to, when the service gives one
   * @throws {Error} with `status` set to the HTTP status, or 0 for a network
   * failure
   */
  recover(email, mfa) {
    const data = {
      username: email.toLowerCase(),
      mfa,
      sid: config.VERIFY.SID,
    };
    if (mfa === 'email') {
      data.channelConfiguration = config.VERIFY.CHANNEL_CONFIGURATION;
    }
    return fetch(`${config.SERVICES.auth.url}/recover`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    }).then(
      async response => {
        const json = await response.json().catch(() => ({}));
        if (response.status === 200) {
          return json;
        }
        // MIGRATION: older rural-mobility-auth deployments answer an unknown
        // account with 401 "User does not exist". The UI treats that the same
        // as a sent code, so it never tells a visitor whether an account
        // exists. Once every auth deployment returns 200 for unknown accounts,
        // remove this branch so a real 401 is reported as an error again.
        if (
          response.status === 401 &&
          json?.error?.message === 'User does not exist'
        ) {
          return {};
        }
        throw httpError(response.status, json);
      },
      () => {
        throw httpError(0);
      }
    );
  },

  /**
   * Sets a new password with a code from recover().
   * @param {String} email
   * @param {String} code
   * @param {String} newPassword
   * @param {'sms'|'call'|'email'} mfa the channel the code was sent through.
   * The service checks SMS and call codes with Twilio and email codes itself,
   * so it needs this to know which check to run.
   * @returns {Promise<true>}
   * @throws {Error} with `status` set to the HTTP status, or 0 for a network
   * failure
   */
  reset(email, code, newPassword, mfa) {
    const data = {
      code,
      username: email.toLowerCase(),
      password: newPassword,
      mfa,
      sid: config.VERIFY.SID,
    };
    return fetch(`${config.SERVICES.auth.url}/reset`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    }).then(
      async response => {
        if (response.status === 200) {
          return true;
        }
        const json = await response.json().catch(() => ({}));
        throw httpError(response.status, json);
      },
      () => {
        throw httpError(0);
      }
    );
  },
};

// An Error carrying the HTTP status and the service's message, so callers can
// show a specific message for rate limits or an unavailable channel.
function httpError(status, json) {
  const error = new Error(json?.error?.message || json?.message || 'Request failed');
  error.status = status;
  return error;
}

export default authentication;
