import config from '../../config';

/**
 * Call when the trip API fails.
 * @param {Error} error
 */
function networkError(error) {
  console.error(error);
}

const otp = {
  /**
   *
   * @param {object} params
   */
  query: params => {
    var strParams = '';
    for (var key in params) {
      strParams += `${key}=${params[key]}&`;
    }

    var uri = `${config.SERVICES.otp}?${strParams}`;

    // console.log('uri', uri);

    return fetch(uri)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        // IGNORE BAD RESPONSES?
      })
      .catch(err => {
        networkError(err);
      });
  },

  /**
   * Execute a GraphQL query
   * @param {string} query - The GraphQL query string
   * @param {object} variables - GraphQL variables
   */
  graphql: (query, variables) => {
    const uri = config.SERVICES.otpGraphQL;
    return fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(`GraphQL request failed: ${response.status}`);
    })
    .then((data) => {
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error(data.errors[0].message);
      }
      return data.data;
    })
    .catch((err) => {
      networkError(err);
      throw err;
    });
  },
};

export default otp;
