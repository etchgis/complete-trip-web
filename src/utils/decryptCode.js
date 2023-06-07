import CryptoJS from 'crypto-js';
import config from '../config';

const secret = config.CAREGIVER_SECRET;

export const decryptCode = code => {
  const bytes = CryptoJS.AES.decrypt(code, secret);
  const obj = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return obj || {};
};

/*

https://completetrip-dev.etch.app/caregiver?code=U2FsdGVkX1%2B06LWdr8juVp6YZOnLofaV4Q%2F3PyD0hfbWsY6Ou8vI4O5ELQFbZN7j8i83NHEawY%2B4%2Bv4WPh3Gpg%3D%3D
*/
