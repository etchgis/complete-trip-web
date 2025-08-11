const API_ENV = 'stage';
const ENV = 'stage';

const CAREGIVER_SECRET =
  '{0E)u#xDi~t8(77:l-MPxA=#u$f)e7$t+yRc[7"g}%C&_wqa>Z2:"=9nU7iE1SW';

const API = {
  dev: {
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
      url: 'https://autoscout.etch.app/plans',
      xApiKey: '',
    },
    trips: {
      url: 'https://staging.lambda.etch.app/trips',
      xApiKey: 'tqoXE84kKo26JPXoTVVIY8eti9JQmAg13BvpGa5K',
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
    caregivers: {
      url: 'https://staging.lambda.etch.app/caregivers',
      xApiKey: 'SjjkKa9IJC1iS4Sq0pEZr21W6NaFXiNT2AE5D3CE',
    },
    notifications: {
      url: 'https://staging.lambda.etch.app/notifications',
      xApiKey: 'qzefkF03af3epdSSiN0Jz8IwSTQBamVD8R4xcfAv',
    },
    feedback: {
      url: 'https://staging.lambda.etch.app/feedback',
      xApiKey: 'hBkiGj26pw1v0h4W3yAc36yFHu8x6dVK9MPRuCPY',
    },
    dispatch: 'http://nfta.localhost:8089/callcenter',
    websocket: 'wss://ce9siadbi5.execute-api.us-east-2.amazonaws.com/staging',
    streamsocket: 'wss://{org}.etch.app/services',
    otp: 'https://ctp-otp.etch.app/otp/routers/default/plan',
    otpGraphQL: 'https://ctp-otp.etch.app/otp/gtfs/v1',
    geocode: 'https://mmapi.etch.app/geocode',
  },
  stage: {
    admin: {
      url: 'https://staging.lambda.etch.app/admin',
      xApiKey: 'iZKVhiZSct7th3GxOVlph6mzV0x3zh0X2UPWa7YB',
    },
    auth: {
      url: 'https://staging.lambda.etch.app/accounts',
      xApiKey: 'EJuLUUwBtd1AMxsEXELgJ9uceOj530yC2OVJnDYS',
    },
    trips: {
      url: 'https://staging.lambda.etch.app/trips',
      xApiKey: 'tqoXE84kKo26JPXoTVVIY8eti9JQmAg13BvpGa5K',
    },
    rides: {
      url: 'https://staging.lambda.etch.app/rides',
      xApiKey: 'tyVuJdnuFv9y1pMc8Ir7Q8D1pygvpAFGl4C9jzgc',
    },
    plans: {
      url: 'https://autoscout.etch.app/plans',
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
    caregivers: {
      url: 'https://staging.lambda.etch.app/caregivers',
      xApiKey: 'SjjkKa9IJC1iS4Sq0pEZr21W6NaFXiNT2AE5D3CE',
    },
    feedback: {
      url: 'https://staging.lambda.etch.app/feedback',
      xApiKey: 'hBkiGj26pw1v0h4W3yAc36yFHu8x6dVK9MPRuCPY',
    },
    dispatch: 'https://nfta-stage.etch.app/callcenter',
    websocket: 'wss://ce9siadbi5.execute-api.us-east-2.amazonaws.com/staging', //'wss://ce9siadbi5.execute-api.us-east-2.amazonaws.com/staging?groups=dependent-{dependentId}
    streamsocket: 'wss://{org}.etch.app/services',
    otp: 'https://ctp-otp.etch.app/otp/routers/default/plan',
    otpGraphQL: 'https://ctp-otp.etch.app/otp/gtfs/v1',
    geocode: 'https://mmapi.etch.app/geocode',
  },
};

const WHEN_OPTIONS = [
  {
    label: 'Leave Now',
    value: 'asap',
  },
  {
    label: 'Leave At',
    value: 'leave',
  },
  {
    label: 'Arrive By',
    value: 'arrive',
  },
];

const ICONS = {
  location: {
    path: 'M272 192C272 236.2 236.2 272 192 272C147.8 272 112 236.2 112 192C112 147.8 147.8 112 192 112C236.2 112 272 147.8 272 192zM192 240C218.5 240 240 218.5 240 192C240 165.5 218.5 144 192 144C165.5 144 144 165.5 144 192C144 218.5 165.5 240 192 240zM384 192C384 279.4 267 435 215.7 499.2C203.4 514.5 180.6 514.5 168.3 499.2C116.1 435 0 279.4 0 192C0 85.96 85.96 0 192 0C298 0 384 85.96 384 192H384zM192 32C103.6 32 32 103.6 32 192C32 207.6 37.43 229 48.56 255.4C59.47 281.3 74.8 309.4 92.14 337.5C126.2 392.8 166.6 445.7 192 477.6C217.4 445.7 257.8 392.8 291.9 337.5C309.2 309.4 324.5 281.3 335.4 255.4C346.6 229 352 207.6 352 192C352 103.6 280.4 32 192 32z',
    viewBox: '0 0 384 512',
  },
  circle: {
    path: 'M512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 32C132.3 32 32 132.3 32 256C32 379.7 132.3 480 256 480C379.7 480 480 379.7 480 256C480 132.3 379.7 32 256 32z',
    viewBox: '0 0 512 512',
  },
  star: {
    path: 'M287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9zM226.5 168.8C221.9 178.3 212.9 184.9 202.4 186.5L64.99 206.8L164.8 305.6C172.1 312.9 175.5 323.4 173.8 333.7L150.2 473.2L272.8 407.7C282.3 402.6 293.6 402.6 303 407.7L425.6 473.2L402.1 333.7C400.3 323.4 403.7 312.9 411.1 305.6L510.9 206.8L373.4 186.5C362.1 184.9 353.1 178.3 349.3 168.8L287.9 42.32L226.5 168.8z',
    viewBox: '0 0 576 512',
  },
};

const WAIT = {
  label: 'Wait',
  name: 'wait',
  icon: 'clock',

  color: '#CCCCCC',
  svg: {
    path: 'M240 112C240 103.2 247.2 96 256 96C264.8 96 272 103.2 272 112V247.4L360.9 306.7C368.2 311.6 370.2 321.5 365.3 328.9C360.4 336.2 350.5 338.2 343.1 333.3L247.1 269.3C242.7 266.3 239.1 261.3 239.1 256L240 112zM256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0zM32 256C32 379.7 132.3 480 256 480C379.7 480 480 379.7 480 256C480 132.3 379.7 32 256 32C132.3 32 32 132.3 32 256z',
    viewBox: '0 0 512 512',
  },
};

const WHEELCHAIR = {
  label: 'Roll',
  name: 'roll',
  icon: 'rolling',

  color: '#616161',
  svg: {
    path: 'M312 56C312 25.07 337.1 0 368 0C398.9 0 424 25.07 424 56C424 86.93 398.9 112 368 112C337.1 112 312 86.93 312 56zM368 80C381.3 80 392 69.25 392 56C392 42.75 381.3 32 368 32C354.7 32 344 42.75 344 56C344 69.25 354.7 80 368 80zM199.5 106.9C187.6 102 173.9 104.8 164.7 113.9L123.3 155.3C117.1 161.6 106.9 161.6 100.7 155.3C94.44 149.1 94.44 138.9 100.7 132.7L142.1 91.26C160.3 73.03 187.7 67.51 211.6 77.28L313.5 118.1C345.3 131.1 353.5 173.1 329.3 197.3L280.2 246.4C287.1 254.3 293.3 262.9 298.6 271.1H432C436.9 271.1 441.4 274.2 444.5 277.1C447.5 281.8 448.7 286.7 447.6 291.5L415.6 435.5C413.7 444.1 405.2 449.5 396.5 447.6C387.9 445.7 382.5 437.2 384.4 428.5L412.1 304H312.7C317.4 319.2 320 335.3 320 352C320 440.4 248.4 512 160 512C71.63 512 0 440.4 0 352C0 263.6 71.63 192 160 192C165.6 192 171.1 192.3 176.5 192.8L244.2 125.2L199.5 106.9zM301.4 148.6L276.3 138.3L213.5 201.2C229.2 206.7 243.8 214.7 256.8 224.6L306.7 174.7C314.7 166.6 311.1 152.9 301.4 148.6V148.6zM160 480C230.7 480 288 422.7 288 352C288 281.3 230.7 224 160 224C89.31 224 32 281.3 32 352C32 422.7 89.31 480 160 480z',
    viewBox: '0 0 448 512',
  },
};

const DESTINATION = {
  label: 'Destination',
  name: 'destination',
  icon: 'destination',
  color: '#4072F3',
  svg: {
    path1: 'M192 144a48 48 0 1 0 0 96 48 48 0 1 0 0-96z',
    path2:
      'M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 112a80 80 0 1 1 0 160 80 80 0 1 1 0-160z',
    viewBox: '0 0 384 512',
  },
};

const MODES = [
  {
    id: 'walk',
    mode: 'walk',
    sort: 0,
    label: 'Walk',
    icon: 'walking',
    type: 'walk',
    accessible: true,
    color: '#616161',
    api: '',
    svg: {
      path: 'M144 56C144 25.07 169.1 0 200 0C230.9 0 256 25.07 256 56C256 86.93 230.9 112 200 112C169.1 112 144 86.93 144 56zM200 80C213.3 80 224 69.25 224 56C224 42.75 213.3 32 200 32C186.7 32 176 42.75 176 56C176 69.25 186.7 80 200 80zM121.5 170.2C120.1 170.9 118.7 171.7 117.2 172.5L92.62 185.9C72.99 196.6 58.74 215 53.31 236.7L47.52 259.9C45.38 268.5 36.69 273.7 28.12 271.5C19.55 269.4 14.34 260.7 16.48 252.1L22.27 228.1C29.86 198.6 49.81 172.8 77.29 157.8L101.9 144.4C121.6 133.6 143.7 127.1 166.1 127.1C202.8 127.1 235.5 151.1 247.9 185.6L269.3 245.6L312.9 274.7C320.2 279.6 322.2 289.5 317.3 296.9C312.4 304.2 302.5 306.2 295.1 301.3L251.5 272.3C245.8 268.4 241.5 262.9 239.2 256.4L225.9 219.4L187.3 331L230.9 368.8C235.6 372.9 238.1 378.2 240.7 384.2L271.4 491.6C273.8 500.1 268.9 508.1 260.4 511.4C251.9 513.8 243 508.9 240.6 500.4L209.9 392.1L109.4 305.8C94.93 293.3 89.29 273.4 94.98 255.2L121.5 170.2zM158.2 160.3L125.5 264.8C123.6 270.8 125.5 277.5 130.3 281.6L161.2 308.4L206.5 177.7C196.3 166.7 181.8 160 166.1 160C163.4 160 160.8 160.1 158.2 160.3H158.2zM95.47 436.8C93.93 439.9 91.91 442.7 89.48 445.1L27.31 507.3C21.07 513.6 10.94 513.6 4.686 507.3C-1.562 501.1-1.562 490.9 4.686 484.7L66.85 422.5L97.69 360.8C101.6 352.9 111.3 349.7 119.2 353.7C127.1 357.6 130.3 367.3 126.3 375.2L95.47 436.8z',
      viewBox: '0 0 320 512',
    },
  },
  {
    id: 'car',
    mode: 'car',
    sort: 5,
    label: 'Car',
    icon: 'car',
    type: 'car',
    accessible: true,
    color: '#3da9da',
    api: '',
    svg: {
      path: 'M80 296C80 282.7 90.75 272 104 272C117.3 272 128 282.7 128 296C128 309.3 117.3 320 104 320C90.75 320 80 309.3 80 296zM432 296C432 309.3 421.3 320 408 320C394.7 320 384 309.3 384 296C384 282.7 394.7 272 408 272C421.3 272 432 282.7 432 296zM48.29 204.7L82.99 89.01C93.14 55.17 124.3 32 159.6 32H352.4C387.7 32 418.9 55.17 429 89.01L463.7 204.7C492.6 221.2 512 252.3 512 288V464C512 472.8 504.8 480 496 480C487.2 480 480 472.8 480 464V416H32V464C32 472.8 24.84 480 16 480C7.164 480 0 472.8 0 464V288C0 252.3 19.44 221.2 48.29 204.7zM85.33 192.6C88.83 192.2 92.39 192 96 192H416C419.6 192 423.2 192.2 426.7 192.6L398.4 98.21C392.3 77.9 373.6 64 352.4 64H159.6C138.4 64 119.7 77.9 113.6 98.21L85.33 192.6zM32 288V384H480V288C480 260.3 462.4 236.7 437.7 227.8L437.3 227.9L437.2 227.6C430.5 225.3 423.4 224 416 224H96C88.58 224 81.46 225.3 74.83 227.6L74.73 227.9L74.27 227.8C49.62 236.7 32 260.3 32 288V288z',
      viewBox: '0 0 512 512',
    },
  },
  {
    id: 'bicycle',
    mode: 'bicycle',
    sort: 2,
    label: 'Bike',
    icon: 'bicycle',
    type: 'bicyle',
    accessible: false,
    color: '#AF272F',
    api: '',
    svg: {
      path: 'M347.2 32C356.1 32 364.3 36.94 368.4 44.82L466.1 232.1C480.1 226.9 496.2 224 512 224C582.7 224 640 281.3 640 352C640 422.7 582.7 480 512 480C441.3 480 384 422.7 384 352C384 308.6 405.6 270.2 438.7 247.1L417.5 206.7L334 359.7C331.2 364.8 325.9 368 320 368H255C247.1 431.1 193.3 480 128 480C57.31 480 0 422.7 0 352C0 281.3 57.31 223.1 128 223.1C142.9 223.1 157.2 226.5 170.5 231.2L197 178.2L166.9 128H112C103.2 128 96 120.8 96 112C96 103.2 103.2 96 112 96H176C181.6 96 186.8 98.95 189.7 103.8L223.5 160H392.9L342.3 64H304C295.2 64 288 56.84 288 48C288 39.16 295.2 32 304 32H347.2zM416 352C416 405 458.1 448 512 448C565 448 608 405 608 352C608 298.1 565 256 512 256C501.5 256 491.5 257.7 482.1 260.8L526.2 344.5C530.3 352.4 527.3 362 519.5 366.2C511.6 370.3 501.1 367.3 497.8 359.5L453.8 275.7C430.8 293.2 416 320.9 416 352V352zM156 260.2C147.2 257.5 137.8 256 127.1 256C74.98 256 31.1 298.1 31.1 352C31.1 405 74.98 448 127.1 448C175.6 448 215.1 413.4 222.7 368H133.2C118.9 368 109.6 352.1 116 340.2L156 260.2zM291.7 336L216.5 210.7L153.9 336H291.7zM242.7 192L319.3 319.8L389 192H242.7z',
      viewBox: '0 0 640 512',
    },
  },
  {
    id: 'bus',
    mode: 'bus',
    sort: 1,
    label: 'Bus',
    icon: 'bus-alt',
    type: 'transit',
    accessible: true,
    color: '#00205B',
    api: '',
    svg: {
      path: 'M336 64C344.8 64 352 71.16 352 80C352 88.84 344.8 96 336 96H240C231.2 96 224 88.84 224 80C224 71.16 231.2 64 240 64H336zM184 352C184 365.3 173.3 376 160 376C146.7 376 136 365.3 136 352C136 338.7 146.7 328 160 328C173.3 328 184 338.7 184 352zM392 352C392 338.7 402.7 328 416 328C429.3 328 440 338.7 440 352C440 365.3 429.3 376 416 376C402.7 376 392 365.3 392 352zM72.3 69.88C96.5 40.06 164.2 0 288 0C420.6 0 481.2 39.95 504.2 70.2C510.2 78.14 512 87.36 512 95.15V384C512 407.7 499.1 428.4 480 439.4V496C480 504.8 472.8 512 464 512C455.2 512 448 504.8 448 496V448H128V496C128 504.8 120.8 512 112 512C103.2 512 96 504.8 96 496V439.4C76.87 428.4 64 407.7 64 384V95.15C64 87.42 65.79 77.91 72.3 69.88V69.88zM288 32C170.1 32 113.2 70.22 97.15 90.05C96.77 90.51 96 91.94 96 95.15V128H480V95.15C480 92 479.2 90.3 478.7 89.53C463.9 70.12 414.8 32 288 32zM272 256V160H96V256H272zM304 256H480V160H304V256zM128 416H448C465.7 416 480 401.7 480 384V288H96V384C96 401.7 110.3 416 128 416zM32 240C32 248.8 24.84 256 16 256C7.164 256 0 248.8 0 240V144C0 135.2 7.164 128 16 128C24.84 128 32 135.2 32 144V240zM576 240C576 248.8 568.8 256 560 256C551.2 256 544 248.8 544 240V144C544 135.2 551.2 128 560 128C568.8 128 576 135.2 576 144V240z',
      viewBox: '0 0 576 512',
    },
  },
  {
    id: 'tram',
    mode: 'tram',
    sort: 1,
    label: 'Metro Rail',
    icon: 'bus-alt',
    type: 'transit',
    accessible: true,
    color: '#00205B',
    api: '',
    svg: {
      path: 'M191.1 344C191.1 357.3 181.3 368 167.1 368C154.7 368 143.1 357.3 143.1 344C143.1 330.7 154.7 319.1 167.1 319.1C181.3 319.1 191.1 330.7 191.1 344zM256 344C256 330.7 266.7 319.1 280 319.1C293.3 319.1 304 330.7 304 344C304 357.3 293.3 368 280 368C266.7 368 256 357.3 256 344zM28.49 65.99C22.97 72.9 12.9 74.01 6.004 68.49C-.8957 62.97-2.014 52.9 3.506 46L16.29 30.02C31.47 11.05 54.46 0 78.76 0H369.2C393.5 0 416.5 11.05 431.7 30.02L444.5 46C450 52.9 448.9 62.97 441.1 68.49C435.1 74.01 425 72.9 419.5 65.99L406.7 50.01C397.6 38.63 383.8 31.1 369.2 31.1H240V95.1H288C341 95.1 384 138.1 384 191.1V352C384 380.9 371.2 406.8 351 424.4L411.3 484.7C417.6 490.9 417.6 501.1 411.3 507.3C405.1 513.6 394.9 513.6 388.7 507.3L322.9 441.5C312 445.7 300.3 448 288 448H159.1C147.7 448 135.1 445.7 125.1 441.5L59.31 507.3C53.06 513.6 42.93 513.6 36.69 507.3C30.44 501.1 30.44 490.9 36.69 484.7L96.96 424.4C76.76 406.8 63.1 380.9 63.1 352V191.1C63.1 138.1 106.1 95.1 159.1 95.1H207.1V31.1H78.76C64.18 31.1 50.39 38.63 41.28 50.01L28.49 65.99zM95.1 191.1V255.1H352V191.1C352 156.7 323.3 127.1 288 127.1H159.1C124.7 127.1 95.1 156.7 95.1 191.1zM95.1 287.1V352C95.1 387.3 124.7 416 159.1 416H288C323.3 416 352 387.3 352 352V287.1H95.1z',
      viewBox: '0 0 448 512',
    },
  },
  {
    id: 'hail',
    mode: 'hail',
    sort: 1,
    label: 'Community Shuttle',
    icon: 'truck-front',
    type: 'transit',
    accessible: true,
    color: '#5bcb40',
    api: '',
    svg: {
      path: 'M80 32C53.5 32 32 53.5 32 80V248.4c10.8-9.7 23.9-17 38.3-21l31.3-88.8c9-25.6 33.2-42.7 60.4-42.7H350c27.1 0 51.3 17.1 60.4 42.7l31.3 88.8c14.4 4 27.4 11.3 38.3 21V80c0-26.5-21.5-48-48-48H80zM32 320v48c0 26.5 21.5 48 48 48H432c26.5 0 48-21.5 48-48V320c0-35.3-28.7-64-64-64H96c-35.3 0-64 28.7-64 64zM0 320V80C0 35.8 35.8 0 80 0H432c44.2 0 80 35.8 80 80V320v48c0 26.2-12.6 49.4-32 64v64c0 8.8-7.2 16-16 16s-16-7.2-16-16V446.4c-5.2 1-10.5 1.6-16 1.6H80c-5.5 0-10.8-.6-16-1.6V496c0 8.8-7.2 16-16 16s-16-7.2-16-16V432C12.6 417.4 0 394.2 0 368V320zm105.4-96H406.6l-26.3-74.7C375.7 136.6 363.6 128 350 128H162c-13.6 0-25.7 8.6-30.2 21.3L105.4 224zM80 328a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm328-24a24 24 0 1 1 0 48 24 24 0 1 1 0-48z',
      viewBox: '0 0 512 512',
    },
  },
  {
    id: 'ubshuttle',
    mode: 'ubshuttle',
    sort: 1,
    label: 'UB Shuttle',
    icon: 'van-shuttle',
    type: 'transit',
    accessible: true,
    color: '#005BBB',
    api: '',
    svg: {
      path: 'M80 32C53.5 32 32 53.5 32 80V248.4c10.8-9.7 23.9-17 38.3-21l31.3-88.8c9-25.6 33.2-42.7 60.4-42.7H350c27.1 0 51.3 17.1 60.4 42.7l31.3 88.8c14.4 4 27.4 11.3 38.3 21V80c0-26.5-21.5-48-48-48H80zM32 320v48c0 26.5 21.5 48 48 48H432c26.5 0 48-21.5 48-48V320c0-35.3-28.7-64-64-64H96c-35.3 0-64 28.7-64 64zM0 320V80C0 35.8 35.8 0 80 0H432c44.2 0 80 35.8 80 80V320v48c0 26.2-12.6 49.4-32 64v64c0 8.8-7.2 16-16 16s-16-7.2-16-16V446.4c-5.2 1-10.5 1.6-16 1.6H80c-5.5 0-10.8-.6-16-1.6V496c0 8.8-7.2 16-16 16s-16-7.2-16-16V432C12.6 417.4 0 394.2 0 368V320zm105.4-96H406.6l-26.3-74.7C375.7 136.6 363.6 128 350 128H162c-13.6 0-25.7 8.6-30.2 21.3L105.4 224zM80 328a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm328-24a24 24 0 1 1 0 48 24 24 0 1 1 0-48z',
      viewBox: '0 0 512 512',
    },
  },
];

const BASEMAPS = {
  // DAY: 'mapbox://styles/jesseglascock/cl3yvm7s3004p14o0wboi3rkw',
  // NIGHT: 'mapbox://styles/jesseglascock/cl3yvm7s3004p14o0wboi3rkw',
  DAY: 'mapbox://styles/jesseglascock/ckzharkag000815s8rewphri4',
  NIGHT: 'mapbox://styles/jesseglascock/ckzharkag000815s8rewphri4',
};

const NOTIFY_METHODS = [
  {
    value: 'push',
    label: 'Push',
  },
  {
    value: 'sms',
    label: 'SMS',
  },
  {
    value: 'voice',
    label: 'Phone Call',
  },
];

const NOTIFICATION_TYPES = {
  traveler: [
    {
      value: 'tripStart',
      label: 'Trip Start',
      types: ['tripStart'],
    },
    {
      value: 'transitArrive',
      label: 'Transit Arrival',
      types: ['transitArrive'],
    },
    {
      value: 'transitDelay',
      label: 'Mass Transit Delay',
      types: ['transitDelay'],
    },
    {
      value: 'shuttleArrive',
      label: 'On Demand Shuttle Arrival',
      types: ['shuttleArrive'],
    },
    {
      value: 'intersection',
      label: 'Enhanced Intersection Information',
      types: ['intersection'],
    },
  ],
  caregiver: [
    {
      value: 'dependentTripStart',
      label: 'Trip Start',
      types: ['dependentTripStart'],
    },
    {
      value: 'dependentArriveDepart',
      label: 'Rider Arrival/Departure',
      types: ['dependentArrive', 'dependentDepart'],
    },
    {
      value: 'dependentShuttleArriveDepart',
      label: 'Rider Shuttle Arrival/Drop Off',
      types: ['dependentShuttleArrive', 'dependentShuttleDepart'],
    },
    {
      value: 'dependentModeChange',
      label: 'Rider Transportation Mode Change',
      types: ['dependentModeChange'],
    },
  ],
};

const LANAGUAGES = {
  en: 'English',
  es: 'Spanish',
};

const FEEDBACK = {
  categories: ['scheduling', 'hds', 'sds', 'intersections', 'transit', 'outdoorNavigation', 'indoorNavigation', 'caregiver', 'accessibility', 'mapping', 'other']
}

const HDS_HOURS = {
  start: [8, 0],
  end: [17, 0]
}

const defaults = {
  ENV: ENV,
  DEBUG: false,
  SERVICES: API[API_ENV],
  MAP: {
    BASEMAPS,
    MAPBOX_TOKEN:
      'pk.eyJ1IjoiZXRjaGpvbiIsImEiOiJjamk3dmVwcjcwZm13M2twYTFjbm11OHM4In0.WLemp1TfP09gg0DRl_q0hg',
    ZOOM: 13,
    KIOSK_ZOOM: 16,
    CENTER: [42.8962389, -78.8644423],
    VIEWBOX: [-74.3878, 43.0283, -74.2989, 43.0755],
  },
  ORGANIZATION: '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
  VERIFY: {
    SID: 'VA716caeea7edda3401dc5f4e9a2e4bc99',
    CHANNEL_CONFIGURATION: {
      template_id: 'complete-trip-verification-code',
      from: 'team@etchgis.com',
      from_name: 'Etch',
    },
  },
  WHEN_OPTIONS,
  WAIT,
  WHEELCHAIR,
  MODES,
  DESTINATION,
  ICONS,
  CAREGIVER_SECRET,

  NOTIFICATION_TYPES,
  LANAGUAGES,
  NOTIFY_METHODS,
  FEEDBACK,
  HDS_HOURS
};
const config = { ...defaults };

export default config;
