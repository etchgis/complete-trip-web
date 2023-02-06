import { makeAutoObservable, runInAction } from 'mobx';
import { authentication } from '../services/transport';

class Registration {
  name = '';
  email = '';
  password = '';
  phone = '';
  address = null;
  caretakers = [];
  terms = false;
  organization = '';
  registeredUser = {};
  error = null;

  constructor(rootStore) {
    this.reset();
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  updateProperty(name, value) {
    runInAction(() => {
      this[name] = value;
    });
  }

  reset() {
    runInAction(() => {
      this.firstName = '';
      this.lastName = '';
      this.email = '';
      this.password = '';
      this.phone = '';
      this.address = null;
      this.caretakers = [];
      this.terms = false;
      this.organization = '';
      this.registeredUser = {};
      this.error = null;
    });
  }

  register() {
    runInAction(() => {
      this.registering = true;
    });
    return new Promise((resolve, reject) => {
      authentication.register(
        this.email,
        this.phone,
        this.organization,
        this.password,
        {
          firstName: this.firstName,
          lastName: this.lastName,
          address: this.address,
          caretakers: this.caretakers,
        },
      )
        .then((result) => {
          runInAction(() => {
            this.error = null;
            this.registering = false;
            this.registeredUser = result;
            resolve(result);
          });
        })
        .catch((e) => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.registering = false;
            reject(e);
          });
        });
    });
  }

  verify() {
    runInAction(() => {
      this.registering = true;
    });
    return new Promise((resolve, reject) => {
      authentication.verify(this.phone, this?.registeredUser?.accessToken)
        .then((result) => {
          runInAction(() => {
            this.error = null;
            this.registering = false;
          });
          resolve(result);
        })
        .catch((e) => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.registering = false;
          });
          reject(e);
        });
    });
  }

  confirm(sid, code) {
    runInAction(() => {
      this.registering = true;
    });
    return new Promise((resolve, reject) => {
      authentication.confirm(sid, this.phone, code/* , this?.registeredUser?.accessToken */)
        .then((result) => {
          runInAction(() => {
            this.error = null;
            this.registering = false;
          });
          resolve(result);
        })
        .catch((e) => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.registering = false;
          });
          reject(e);
        });
    });
  }

  activate(token) {
    runInAction(() => {
      this.registering = true;
    });
    return new Promise((resolve, reject) => {
      authentication.activate(token)
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.registering = false;
          });
          reject(e);
        });
    });
  }
}

export default Registration;
