import config from '../../config';

const caregivers = {
  invite(email, name, accessToken) {
    return fetch(`${config.SERVICES.caregivers.url}`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.caregivers.xApiKey,
      },
    })
      .then(async response => {
        const json = await response.json();
        if (response.status === 200) {
          return json;
        }
        throw json?.error?.message || json?.error.reason;
      })
      .catch(err => {
        throw err;
      });
  },

  get: {
    all(accessToken) {
      return fetch(`${config.SERVICES.caregivers.url}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': config.SERVICES.caregivers.xApiKey,
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

    approved(accessToken) {
      return fetch(`${config.SERVICES.caregivers.url}?status=approved`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': config.SERVICES.caregivers.xApiKey,
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

    pending(accessToken) {
      return fetch(`${config.SERVICES.caregivers.url}?status=pending`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': config.SERVICES.caregivers.xApiKey,
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

    byId(id, accessToken) {
      return fetch(`${config.SERVICES.caregivers.url}/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': config.SERVICES.caregivers.xApiKey,
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
  },

  update: {
    status(id, status, accessToken) {
      return fetch(`${config.SERVICES.caregivers.url}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
        }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-api-key': config.SERVICES.caregivers.xApiKey,
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
  },

  delete(id, accessToken) {
    return fetch(`${config.SERVICES.caregivers.url}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.caregivers.xApiKey,
      },
    })
      .then(async response => {
        if (response.status === 200) {
          return true;
        }
        throw { message: 'Unknown error' };
      })
      .catch(err => {
        throw err;
      });
  },
};

export default caregivers;
