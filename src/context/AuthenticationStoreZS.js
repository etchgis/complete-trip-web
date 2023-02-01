import authentication from '../services/transport/authentication';
import { create } from 'zustand';
import jwtDecode from 'jwt-decode';
import { persist } from 'zustand/middleware';

const validateJWT = token => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp > Date.now() / 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

const {
  login: authLogin,
  register: authRegister,
  update: authUpdateProfile,
} = authentication;

const defaultState = {
  user: {},
  stagedUser: {},
  loggedIn: false,
  loggingIn: false,
  error: null,
  registering: false,
  accessTokenPromise: false,
};

export const useAuthenticationStore = create(
  persist(
    (set, get) => ({
      user: {},
      stagedUser: {},
      loggedIn: false,
      // loggingIn: false,
      // registering: false,
      inTransaction: false,
      setInTransaction: e => set(() => ({ inTransaction: e })),
      test: null,
      error: null,
      // accessTokenPromise: null,

      setError: e => set(() => ({ error: e })),

      validateUser: async () => {
        console.log('[validate-user]');
        try {
          const { accessToken } = get().user;
          if (!accessToken || !validateJWT(accessToken))
            return set(() => ({
              user: {},
              loggedIn: false,
              inTransaction: false,
            }));
          set(() => ({ loggedIn: true, inTransaction: false }));
        } catch (error) {
          return set(() => ({
            user: {},
            loggedIn: false,
            inTransaction: false,
          }));
        }

        //TODO add refresh token
        //TODO add error on refresh token
        // if (refreshToken) {
        //   const newToken = await refreshAccessToken(refreshToken);
        //   console.log({ newToken });
        // } else {
        // }
        //TODO add error on validate
      },

      setLoggedIn: e => set(() => ({ loggedIn: e })),

      login: async (email, password) => {
        try {
          get().setError(null);
          const newUser = await authLogin(email, password);
          return set({ user: newUser, loggedIn: true, inTransaction: false });
        } catch (error) {
          return set(() => ({
            error: 'Trouble logging in.',
            inTransaction: false,
          }));
        }
      },

      register: async (email, phone, organization, password, profile) => {
        try {
          get().setError(null);
          // console.log({ profile });
          const newUser = await authRegister(
            email,
            phone,
            organization,
            password,
            profile
          );
          set({ user: newUser, loggedIn: true, inTransaction: false });
          return get().user;
        } catch (error) {
          console.log({ error });
          return set(() => ({
            user: {},
            error:
              error?.reason && error.reason === 'Conflict'
                ? 'This email is already in use. Return to the login screen if you forgot your password.'
                : 'Trouble registering.',
            inTransaction: false,
          }));
        }
      },

      setStagedUser: update =>
        set(() => ({
          stagedUser: !update ? {} : Object.assign(get().stagedUser, update),
        })),

      logout: () =>
        set(() => ({ user: {}, loggedIn: false, inTransaction: false })),

      reset: () => set(() => defaultState),

      getUser: () => get().user,

      updateUser: update =>
        set(state => ({ user: Object.assign(state.user, update) })),

      updateUserProfile: async update => {
        try {
          get().setError(null);
          const { profile, accessToken } = get().user;
          const newProfile = Object.assign(profile, update);
          console.log(newProfile);
          const updatedUser = await authUpdateProfile(
            { profile: newProfile },
            accessToken
          );
          return set({
            user: Object.assign(get().user, updatedUser),
            inTransaction: false,
          });
        } catch (error) {
          console.log({ error });
          return set(() => ({
            error: 'Trouble updating profile.',
            inTransaction: false,
          }));
        }
      },
    }),
    {
      name: '__mba_auth',
      partialize: state => ({ user: state.user }),
    }
  )
);

// class MOBX__Authentication {
//   user = {};

//   loggedIn = false;

//   loggingIn = false;

//   registering = false;

//   error = null;

//   accessTokenPromise = null;

//   constructor(rootStore) {
//     makeAutoObservable(this);
//     this.rootStore = rootStore;

//     if (
//       !Array.from(PersistStoreMap.values())
//         .map(item => item.storageName)
//         .includes('Display')
//     ) {
//       makePersistable(this, {
//         name: 'Authentication',
//         properties: ['user'],
//         storage: AsyncStorage,
//       });
//     }
//   }

//   clearError() {
//     runInAction(() => {
//       this.error = null;
//     });
//   }

//   /**
//    * Get the user's access token, renewing if necessary.
//    * Several modules might call this in parallel, but it won't do a separate query for
//    * each one.
//    * @returns {Promise} - the user access token.
//    */
//   fetchAccessToken() {
//     if (this.accessTokenPromise) {
//       return this.accessTokenPromise;
//     }
//     if (!this.user?.refreshToken) {
//       return Promise.reject(new Error('not logged in'));
//     }
//     if (validateJWT(this.user.accessToken)) {
//       return Promise.resolve(this.user.accessToken);
//     }
//     this.accessTokenPromise = authentication
//       .refreshAccessToken(this.user.refreshToken)
//       .then(result => {
//         this.accessTokenPromise = null;
//         if (result.accessToken) {
//           const refreshedUser = this.user;
//           refreshedUser.accessToken = result.accessToken;
//           runInAction(() => {
//             this.user = refreshedUser;
//           });
//           return result.accessToken;
//         }
//         throw new Error('user access failed');
//       });
//     return this.accessTokenPromise;
//   }

//   login(email, password) {
//     runInAction(() => {
//       this.loggingIn = true;
//     });
//     return new Promise((resolve, reject) => {
//       authentication
//         .login(email, password)
//         .then(async result => {
//           runInAction(() => {
//             this.user = result;
//             this.error = null;
//             this.loggingIn = false;
//           });
//         })
//         .catch(e => {
//           runInAction(() => {
//             this.error = 'Incorrect email or password';
//             this.loggingIn = false;
//           });
//           reject(e);
//         });
//     });
//   }

//   logout() {
//     // userManager.gotLogout();
//     this.reset();
//   }

//   reset() {
//     runInAction(() => {
//       this.rootStore.map.hide();
//       this.rootStore.menu.reset();
//       this.rootStore.registration.reset();
//       this.rootStore.schedule.reset();
//       this.user = {};
//       this.error = null;
//       this.loggingIn = false;
//       this.registering = false;
//     });
//   }

//   updateUser(user) {
//     runInAction(() => {
//       this.user = user;
//     });
//   }

//   updateUserProfile(profile) {
//     return new Promise(resolve => {
//       authentication
//         .update({ profile }, this.user.accessToken)
//         .then(result => {
//           runInAction(() => {
//             this.user.profile = result?.profile;
//           });
//           resolve(profile);
//         })
//         .catch(e => {
//           console.warn(e);
//           resolve({ error: e });
//         });
//     });
//   }
// }
