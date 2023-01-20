const ENV = 'stage';

const API = {
  stage: {
    admin: {
      url: 'https://staging.lambda.etch.app/admin',
      xApiKey: 'iZKVhiZSct7th3GxOVlph6mzV0x3zh0X2UPWa7YB',
    },
    auth: {
      url: 'https://staging.lambda.etch.app/accounts',
      xApiKey: 'EJuLUUwBtd1AMxsEXELgJ9uceOj530yC2OVJnDYS',
    },
    rides: {
      url: 'https://staging.lambda.etch.app/rides',
      xApiKey: 'tyVuJdnuFv9y1pMc8Ir7Q8D1pygvpAFGl4C9jzgc',
    },
    plans: {
      url: 'https://staging.lambda.etch.app/plans',
      xApiKey: '',
    },
    plantrip: {
      url: 'http://192.168.86.249:8082/plantrip',
      xApiKey: '',
    },
    routes: {
      url: 'https://staging.lambda.etch.app/routes',
      xApiKey: 'kIAVhCZcQI3QExnHTQzDI1gHKLxF6KBm2jazpU2K',
    },
    verifications: {
      url: 'https://staging.lambda.etch.app/verifications',
      xApiKey: '4pJ5BNCYYj4fz3eyJWhZVadrPgeyl39D8ykWgCS8',
    },
    websocket: 'wss://ce9siadbi5.execute-api.us-east-2.amazonaws.com/staging',
    streamsocket: 'wss://{org}.etch.app/services',
  },
};

const BASEMAPS = {
  DAY: 'mapbox://styles/jesseglascock/cl3yvm7s3004p14o0wboi3rkw',
  NIGHT: 'mapbox://styles/jesseglascock/cl3yvpaof004q14o0fvuffphw',
};

const defaults = {
  SERVICES: API[ENV],
  MAP: {
    BASEMAPS,
    MAPBOX_TOKEN:
      'pk.eyJ1IjoiZXRjaGpvbiIsImEiOiJjamk3dmVwcjcwZm13M2twYTFjbm11OHM4In0.WLemp1TfP09gg0DRl_q0hg',
    ZOOM: 3,
    CENTER: [-99.02475, 39.28159],
  },
};
const Config = { ...defaults, defaults };
export default Config;
