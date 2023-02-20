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
  DEBUG: false,
  SERVICES: API[ENV],
  MAP: {
    BASEMAPS,
    MAPBOX_TOKEN:
      'pk.eyJ1IjoiZXRjaGpvbiIsImEiOiJjamk3dmVwcjcwZm13M2twYTFjbm11OHM4In0.WLemp1TfP09gg0DRl_q0hg',
    ZOOM: 3,
    CENTER: [-99.02475, 39.28159],
    VIEWBOX: [-74.3878, 43.0283, -74.2989, 43.0755],
  },
  ORGANIZATION: '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
  VERIFY: {
    SID: 'VA716caeea7edda3401dc5f4e9a2e4bc99',
    CHANNEL_CONFIGURATION: {
      template_id: 'd-731f00a0bfbd472fa144d863869d145d',
      from: 'team@etchgis.com',
      from_name: 'Etch',
    },
  },
};

const config = { ...defaults, defaults };

export default config;
