import config from '../../config';

const rides = {

  request(organizationId, datetime, direction, pickup, dropoff, driverId, passengers, phone, pin) {
    const body = {
      organization: organizationId,
      passengers: passengers || 1,
      datetime,
      direction,
      pickup,
      dropoff,
      status: 'scheduled',
      phone,
      pin
    };
    if (driverId) {
      body.driver = driverId;
    }
    return fetch(`${config.SERVICES.rides.url}/request`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        // Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': config.SERVICES.rides.xApiKey,
      },
    }).then(async (response) => {
      const json = await response.json();
      if (response.status === 200) {
        fetch(`${config.SERVICES.plans.url}/ride/${json.id}`, {
          method: 'PATCH',
          headers: {
            // Authorization: `Bearer ${accessToken}`,
            'X-Organization-Id': organizationId,
            // 'x-api-key': config.SERVICES.plans.xApiKey,
          },
        });
        return json;
      }
      throw json?.message || json?.error.message;
    }).catch((err) => {
      throw err;
    });
  },

};

export default rides;
