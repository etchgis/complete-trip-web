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
        console.log('got refresh token response');
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

  login(email, password) {
    return fetch(`${config.SERVICES.auth.url}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('got login response');
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
    return fetch(`${config.SERVICES.auth.url}/register`, {
      method: 'POST',
      body: JSON.stringify({
        email,
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

  verify(to) {
    return fetch(`${config.SERVICES.auth.url}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        channel: 'sms',
        to: `+${to}`,
        friendlyName: 'Rural Verification Service',
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
        throw json?.error;
      })
      .catch(err => {
        throw err;
      });
  },

  confirm(sid, to, code) {
    return fetch(`${config.SERVICES.auth.url}/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        sid,
        to: `+${to}`,
        code,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('got confirm response');
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
        console.log('got patch auth response');
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
        console.log('got auth activate response');
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
    console.log(`registering device with ID ${identity}`);
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
        console.log('registration failed');
        throw err;
      });
  },

  removeDeviceIfRegistered(identity, accessToken) {
    console.log(`deleting ${config.SERVICES.auth.url}/devices/${identity}`);
    return fetch(`${config.SERVICES.auth.url}/devices/${identity}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.auth.xApiKey,
      },
    })
      .then(async response => {
        console.log('got remove device response');
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
};

export default authentication;