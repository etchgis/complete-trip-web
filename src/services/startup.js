/* eslint-disable react-hooks/rules-of-hooks */
// import { useEffect } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
// import SplashScreen from 'react-native-splash-screen';
import { faUser, faLock, faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const module = {

  init(store) {
    library.add(faUser, faLock, faChevronLeft, faMagnifyingGlass);
    // useEffect(() => {
    //   SplashScreen.hide();
    // });
  },

};

export default module;
