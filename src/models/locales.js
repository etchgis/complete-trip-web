/*
ref: https://www.npmjs.com/package/i18n-js/v/latest
  en: { greetings: "Hi, %{name}!" },

  //counts
    en: {
    inbox: {
      zero: "You have no messages",
      one: "You have one message",
      other: "You have %{count} messages",
    },
  },
*/

export default function genLocales() {
  return {
    time: {
      en: {
        jan: 'January',
        feb: 'February',
        mar: 'March',
        apr: 'April',
        may: 'May',
        jun: 'June',
        jul: 'July',
        aug: 'August',
        sep: 'September',
        oct: 'October',
        nov: 'November',
        dec: 'December',
        janAbr: 'jan',
        febAbr: 'feb',
        marAbr: 'mar',
        aprAbr: 'apr',
        mayAbr: 'may',
        junAbr: 'jun',
        julAbr: 'jul',
        augAbr: 'aug',
        sepAbr: 'sep',
        octAbr: 'oct',
        novAbr: 'nov',
        decAbr: 'dec',
        mon: 'MON',
        tue: 'TUE',
        wed: 'WED',
        thu: 'THU',
        fri: 'FRI',
        sat: 'SAT',
        sun: 'SUN',
        hasTrips: 'You have trips on this day.',
      },
      es: {
        jan: 'enero', //✅
        feb: 'febrero', //✅
        mar: 'marzo', //✅
        apr: 'abril', //✅
        may: 'mayo', //✅
        jun: 'junio', //✅
        jul: 'julio', //✅
        aug: 'agosto', //✅
        sep: 'septiembre', //✅
        oct: 'octubre', //✅
        nov: 'noviembre', //✅
        dec: 'diciembre', //✅
        janAbr: 'ene',
        febAbr: 'feb',
        marAbr: 'mar',
        aprAbr: 'abr',
        mayAbr: 'may',
        junAbr: 'jun',
        julAbr: 'jul',
        augAbr: 'ago',
        sepAbr: 'set',
        octAbr: 'oct',
        novAbr: 'nov',
        decAbr: 'dic',
        mon: 'lun',
        tue: 'mar',
        wed: 'ié',
        thu: 'jue',
        fri: 'vie',
        sat: 'sáb',
        sun: 'dom',
        hasTrips: 'Tienes viajes en este día.', //✅
      },
    },
    global: {
      en: {
        site: 'All Access',
        name: 'name',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        emailAddress: 'Email Address',
        phone: 'Phone',
        save: 'Save',
        submit: 'Submit',
        cancel: 'Cancel',
        close: 'Close',
        home: 'Home',
        trips: 'Trips',
        profileSettings: 'Profile and Settings',
        accessibility: 'Accessibility',
        favorite: 'Favorite',
        next: 'Next',
        prev: 'Previous',
        skip: 'Skip',
        yes: 'Yes',
        no: 'No',
        to: 'To',
        loading: 'Loading',
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',

        second: 'Second',
        third: 'Third',

        caregiver: 'Caregiver',

        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        active: 'Active',
      },
      es: {
        site: 'All Access',
        name: 'nombre', //✅
        firstName: 'Nombre', //✅
        lastName: 'Apellido', //✅
        email: 'Correo electrónico',
        emailAddress: 'Correo Electrónico', //✅
        phone: 'Número de Teléfono', //✅
        save: 'Guardar',
        submit: 'Enviar',
        cancel: 'Cancelar',
        close: 'Cerrar',
        home: 'Hogar', //✅
        trips: 'Viajes', //✅
        profileSettings: 'Perfil y configuración', //✅
        accessibility: 'Accesibilidad',
        favorite: 'Favorito',
        next: 'Próximo',
        prev: 'Anterior', //✅
        skip: 'Saltar', //✅
        yes: 'Sí',
        no: 'No',
        to: 'hacia', //✅
        loading: 'Cargando',
        prevMonth: 'Mes Anterior', //✅
        nextMonth: 'Mes Próximo', //✅
        second: 'Segundo',
        third: 'Tercero',
        caregiver: 'Cuidador',

        error: 'Error',
        success: 'Éxito', //✅
        warning: 'Advertencia',
        info: 'Información',
        active: 'Activo',
      },
    },
    errors: {
      en: {
        unknown: 'Unknown Error',
        recover: 'Error sending code. Please try again.',
        conflict: 'This email is already registered. Please login.',
        expired: 'Your session has expired. Please login.',
        pleaseSelectLocation: 'Please select a location from the list',
      },
      es: {
        unknown: 'Error desconocido', //✅
        recover: 'Error al enviar el código. Por favor, inténtelo de nuevo.', //✅
        conflict:
          'Este correo electrónico ya está registrado. Por favor inicie sesión.',
        expired: 'Su sesión ha caducado. Por favor, inicie sesión.',
        pleaseSelectLocation: 'Por favor seleccione una ubicación de la lista', //✅
      },
    },
    navbar: {
      en: {
        logout: 'Logout',
        loginSignUp: 'Login/Sign Up',
        toggle: 'Toggle Navigation Menu',
      },
      es: {
        logout: 'Cerrar sesión',
        loginSignUp: 'Iniciar sesión/Registrarse',
        toggle: 'Alternar Menú de Navegación', //✅
      },
    },
    sidebar: {
      en: {
        home: 'Home',
        trips: 'Trips',
        map: 'Map',
        profile: 'Profile and Settings',
        accessibility: 'Accessibility',
      },
      es: {
        home: 'Página Principal', //✅
        trips: 'Viajes',
        map: 'Mapa',
        profile: 'Perfil y configuración', //✅
        accessibility: 'Accesibilidad',
      },
    },
    ariaWidget: {
      en: {
        settings: 'Settings',
        fontSize: 'Font Size',
        medium: 'Medium',
        large: 'Large',
        contrast: 'Contrast',
        disableHighContrast: 'Disable High Contrast',
        enableHighContrast: 'Enable High Contrast',

        letterSpacing: 'Letter Spacing',
        expandLetterSpacing: 'Expand Letter Spacing',
        revertExpandedSpacing: 'Revert to Normal Spacing',
        expanded: 'Expanded',
        normal: 'Normal',
        cursorSize: 'Cursor Size',
        largeCursor: 'Larger Cursor Size',
        en: 'English',
        es: 'Spanish',
      },
      es: {
        settings: 'CONFIGURACIÓN', //✅
        fontSize: 'Tamaño de las Letras', //✅
        medium: 'Medio', //✅
        large: 'Grande', //✅
        contrast: 'Contraste', //✅
        disableHighContrast: 'Desactivar Contraste Alto', //✅
        enableHighContrast: 'Activar Contraste Alto', //✅
        letterSpacing: 'Espaciado entre Letras', //✅
        expandLetterSpacing: 'Ampliar Espacio entre Letras', //✅
        revertExpandedSpacing: 'Volver al Espaciado Normal', //✅
        expanded: 'Ampliado', //✅
        normal: 'Normal (tipo de letra)', //✅
        cursorSize: 'Tamaño del Cursor', //✅
        largeCursor: 'Tamaño Grande del Cursor', //✅
        en: 'Inglés', //✅
        es: 'Español', //✅
      },
    },
    loginWizard: {
      en: {
        login: 'Login',
        register: 'Sign Up',
        signUp: 'Sign Up',
        continueGuest: 'Continue as Guest',
        email: 'Email address',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        createAccount: 'Create Account',
        accountCreated: 'Your account has been created. Please login.',

        accessibilityOptions: 'Accessibility Options',

        verifyPhone: 'Verify your phone number to continue',

        addContactInfo: 'Add Contact Information',
        addContactInfoDescription: `Your email and phone number are used for two-step verification, password
        recovery, and notifications about your trips.`,

        addHomeAddress: 'Add Home Address',
        addHomeDescription: `This helps create routes from your home with ease.`,

        addPrimaryCaregiver: 'Add Primary Coordinator',
        addPrimaryCaregiverDescription: `Notify your companions in 1-touch for any of your trips.`,

        addMobilityOptions: 'Enhanced Mobility Options',
        addMobilityOptionsDescription: `Enter in your email to find enhanced mobility options you are registered with such as [x]`,

        // addAnotherEmail: 'Add Another email address',

        termsTitle: 'Terms and Conditions',
        termsMessage: 'I agree to the Terms and Conditions',
        termsText:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id leo in vitae turpis massa. Proin fermentum leo vel orci. In nulla posuere sollicitudin aliquam ultrices. Enim neque volutpat ac tincidunt vitae. Pharetra convallis posuere morbi leo urna molestie at. Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus. In est ante in nibh. Lobortis mattis aliquam faucibus purus in massa tempor nec. Eget velit aliquet sagittis id consectetur. Lacus sed turpis tincidunt id aliquet risus feugiat in. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Praesent tristique magna sit amet purus gravida. A cras semper auctor neque vitae. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Varius quam quisque id diam. Phasellus vestibulum lorem sed risus ultricies. Mollis nunc sed id semper risus in.\n\nVolutpat commodo sed egestas egestas. Ut venenatis tellus in metus vulputate. Rhoncus est pellentesque elit ullamcorper dignissim cras. At risus viverra adipiscing at in tellus integer. Libero enim sed faucibus turpis in eu mi bibendum. Convallis convallis tellus id interdum velit laoreet id donec. Quam vulputate dignissim suspendisse in est ante in. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Gravida rutrum quisque non tellus. Massa tincidunt dui ut ornare lectus sit amet est placerat. Habitasse platea dictumst quisque sagittis purus. Quam nulla porttitor massa id. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Amet aliquam id diam maecenas ultricies mi. Mattis nunc sed blandit libero volutpat sed. Turpis egestas maecenas pharetra convallis posuere morbi. Eget magna fermentum iaculis eu non diam phasellus vestibulum. Semper viverra nam libero justo laoreet sit amet cursus. Libero enim sed faucibus turpis in eu mi bibendum. Tortor at auctor urna nunc id cursus.\n\nSed tempus urna et pharetra pharetra massa massa. Lorem mollis aliquam ut porttitor leo a. Enim diam vulputate ut pharetra. Venenatis cras sed felis eget. Consequat ac felis donec et odio pellentesque diam. Senectus et netus et malesuada fames ac turpis egestas. Nulla facilisi nullam vehicula ipsum. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam. Venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam. Fusce ut placerat orci nulla pellentesque dignissim enim. Ante in nibh mauris cursus mattis molestie a iaculis. Nulla pharetra diam sit amet. Massa tincidunt dui ut ornare lectus sit amet est. Eu nisl nunc mi ipsum faucibus vitae aliquet. Diam in arcu cursus euismod quis viverra nibh cras. Fusce ut placerat orci nulla pellentesque dignissim enim. Lectus mauris ultrices eros in cursus turpis massa tincidunt. Nisl rhoncus mattis rhoncus urna neque viverra justo. In hac habitasse platea dictumst quisque sagittis purus sit amet.\n\nRhoncus mattis rhoncus urna neque viverra justo nec ultrices. Amet luctus venenatis lectus magna fringilla. Blandit massa enim nec dui. Consectetur adipiscing elit duis tristique sollicitudin nibh. Eget duis at tellus at. Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum. Imperdiet dui accumsan sit amet nulla facilisi. Eu augue ut lectus arcu bibendum at. Eget dolor morbi non arcu risus quis varius. Purus in mollis nunc sed. Dui vivamus arcu felis bibendum ut tristique. In cursus turpis massa tincidunt dui ut ornare.\n\nEget dolor morbi non arcu risus. Ac tortor dignissim convallis aenean. Leo vel orci porta non pulvinar neque. Nulla facilisi cras fermentum odio eu feugiat. Tincidunt tortor aliquam nulla facilisi cras. Ut placerat orci nulla pellentesque dignissim enim sit amet venenatis. Donec adipiscing tristique risus nec feugiat in fermentum posuere. Lectus mauris ultrices eros in cursus. Adipiscing at in tellus integer. Enim ut tellus elementum sagittis vitae et leo duis ut. Donec et odio pellentesque diam. Nec nam aliquam sem et tortor consequat. A pellentesque sit amet porttitor eget dolor morbi non. Massa eget egestas purus viverra.',
        terms1: 'I agree to the',
        terms2: 'terms and conditions',
        accept: 'Accept',
        decline: 'Decline',

        haveAccount: 'Already have an account?',
      },
      es: {
        login: 'Iniciar sesión',
        register: 'Regístrate', //✅
        signUp: 'Regístrate',
        continueGuest: 'Continuar como invitado',
        email: 'Correo electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidó su contraseña?',
        noAccount: '¿No tienes una cuenta?',
        createAccount: 'Crear cuenta',
        accountCreated: 'Su cuenta ha sido creada. Por favor, inicie sesión.', //✅

        accessibilityOptions: 'Opciones de Accesibilidad',

        verifyPhone: 'Verifique tu número de teléfono para continuar', //✅

        addContactInfo: 'Agregar información de contacto',
        addContactInfoDescription: `Su correo electrónico y número de teléfono se utilizan para la verificación en dos pasos, la recuperación de contraseña y las notificaciones sobre sus viajes.`, //✅

        addHomeAddress: 'Agregar Dirección de su Hogar', //✅
        addHomeDescription: `Esto ayuda a crear rutas desde su hogar con facilidad.`,

        addPrimaryCaregiver: 'Agregar Coordinador Principal', //✅
        addPrimaryCaregiverDescription: `Notifique a sus compañeros en 1 toque para cualquiera de sus viajes.`,
        addMobilityOptions: 'Opciones de Movilidad Mejoradas',
        addMobilityOptionsDescription: `Ingrese su correo electrónico para encontrar opciones de movilidad mejoradas con las que está registrado, como [x]`,
        // addAnotherEmail: 'Agregar otra dirección de correo electrónico',

        termsTitle: 'Términos y condiciones',
        termsMessage: 'Acepto los Términos y Condiciones',
        termsText:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id leo in vitae turpis massa. Proin fermentum leo vel orci. In nulla posuere sollicitudin aliquam ultrices. Enim neque volutpat ac tincidunt vitae. Pharetra convallis posuere morbi leo urna molestie at. Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus. In est ante in nibh. Lobortis mattis aliquam faucibus purus in massa tempor nec. Eget velit aliquet sagittis id consectetur. Lacus sed turpis tincidunt id aliquet risus feugiat in. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Praesent tristique magna sit amet purus gravida. A cras semper auctor neque vitae. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Varius quam quisque id diam. Phasellus vestibulum lorem sed risus ultricies. Mollis nunc sed id semper risus in.\n\nVolutpat commodo sed egestas egestas. Ut venenatis tellus in metus vulputate. Rhoncus est pellentesque elit ullamcorper dignissim cras. At risus viverra adipiscing at in tellus integer. Libero enim sed faucibus turpis in eu mi bibendum. Convallis convallis tellus id interdum velit laoreet id donec. Quam vulputate dignissim suspendisse in est ante in. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Gravida rutrum quisque non tellus. Massa tincidunt dui ut ornare lectus sit amet est placerat. Habitasse platea dictumst quisque sagittis purus. Quam nulla porttitor massa id. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Amet aliquam id diam maecenas ultricies mi. Mattis nunc sed blandit libero volutpat sed. Turpis egestas maecenas pharetra convallis posuere morbi. Eget magna fermentum iaculis eu non diam phasellus vestibulum. Semper viverra nam libero justo laoreet sit amet cursus. Libero enim sed faucibus turpis in eu mi bibendum. Tortor at auctor urna nunc id cursus.\n\nSed tempus urna et pharetra pharetra massa massa. Lorem mollis aliquam ut porttitor leo a. Enim diam vulputate ut pharetra. Venenatis cras sed felis eget. Consequat ac felis donec et odio pellentesque diam. Senectus et netus et malesuada fames ac turpis egestas. Nulla facilisi nullam vehicula ipsum. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam. Venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam. Fusce ut placerat orci nulla pellentesque dignissim enim. Ante in nibh mauris cursus mattis molestie a iaculis. Nulla pharetra diam sit amet. Massa tincidunt dui ut ornare lectus sit amet est. Eu nisl nunc mi ipsum faucibus vitae aliquet. Diam in arcu cursus euismod quis viverra nibh cras. Fusce ut placerat orci nulla pellentesque dignissim enim. Lectus mauris ultrices eros in cursus turpis massa tincidunt. Nisl rhoncus mattis rhoncus urna neque viverra justo. In hac habitasse platea dictumst quisque sagittis purus sit amet.\n\nRhoncus mattis rhoncus urna neque viverra justo nec ultrices. Amet luctus venenatis lectus magna fringilla. Blandit massa enim nec dui. Consectetur adipiscing elit duis tristique sollicitudin nibh. Eget duis at tellus at. Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum. Imperdiet dui accumsan sit amet nulla facilisi. Eu augue ut lectus arcu bibendum at. Eget dolor morbi non arcu risus quis varius. Purus in mollis nunc sed. Dui vivamus arcu felis bibendum ut tristique. In cursus turpis massa tincidunt dui ut ornare.\n\nEget dolor morbi non arcu risus. Ac tortor dignissim convallis aenean. Leo vel orci porta non pulvinar neque. Nulla facilisi cras fermentum odio eu feugiat. Tincidunt tortor aliquam nulla facilisi cras. Ut placerat orci nulla pellentesque dignissim enim sit amet venenatis. Donec adipiscing tristique risus nec feugiat in fermentum posuere. Lectus mauris ultrices eros in cursus. Adipiscing at in tellus integer. Enim ut tellus elementum sagittis vitae et leo duis ut. Donec et odio pellentesque diam. Nec nam aliquam sem et tortor consequat. A pellentesque sit amet porttitor eget dolor morbi non. Massa eget egestas purus viverra.',
        terms1: 'Acepto los ',
        terms2: 'términos y condiciones',
        accept: 'Aceptar',
        decline: 'Declinar', //✅

        haveAccount: '¿Ya tiene una cuenta?',
      },
    },

    forgotPassword: {
      en: {
        message: `In order to reset your password, a code will need to be sent to the email or device registered with us.`,
        codeOptions: 'How would you like to receive the code?',
        sms: 'Text Me',
        call: 'Call Me',
        email: 'Email Me',
        sendCode: 'Send Code',
      },
      es: {
        message: `Para restablecer su contraseña, deberá enviar un código al correo electrónico o al dispositivo registrado con nosotros.`, //✅
        codeOptions: '¿Cómo le gustaría recibir el código?',
        sms: 'Envíame un mensaje de texto',
        call: 'Llámame',
        email: 'Envíame un correo electrónico',
        sendCode: 'Reenviar codigo', //✅
      },
    },

    resetPassword: {
      en: {
        message: `Type in the 6-digit code. The code can also be pasted in the first box.`,
        resendCode: 'Send Another Code',
        invalidCode: 'Invalid Code',
      },
      es: {},
    },

    terms: {
      en: {},
      es: {},
    },

    caregiverLink: {
      en: {
        title: 'Caregiver Link',
        description:
          'Caregiver Link is a service that connects caregivers with their loved ones.',
        login: 'Log In',
        signUp: 'Sign Up',
        forgotPassword: 'Forgot Password?',
      },
      es: {
        title: 'Enlace de Cuidador',
        description:
          'Enlace de Cuidador es un servicio que conecta a los cuidadores con sus seres queridos.',
        login: 'Iniciar sesión',
        signUp: 'Regístrate',
        forgotPassword: '¿Olvidó su contraseña?',
      },
    },
    home: {
      en: {
        tripButton: 'Schedule a Trip',
        tripName: 'Trip Name',
        saveFavorite: 'Save as Favorite',
      },
      es: {
        tripButton: 'Programar un Viaje',
        tripName: 'Nombre del Viaje',
        saveFavorite: 'Guardar como Favorito',
      },
    },
    map: {
      en: {
        searchTitle: 'Find Nearby Routes',
        searchPlaceholder: 'Start typing an address...',

        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        location: 'Find My Location',
        improve: 'Improve this map',
        ariaDescription:
          'Interact with the map using the keyboard and screen reader.',
      },
      es: {
        searchTitle: 'Encuentra Rutas Cercanas', //✅
        searchPlaceholder: 'Empiece a escribir una dirección...', //✅

        zoomIn: 'Acercar',
        zoomOut: 'Alejar',
        location: 'Encuentra mi Ubicación', //✅
        improve: 'Mejorar este mapa',
      },
    },
    routeList: {
      en: {
        next: 'Next',
        back: 'Back',
        servicing: 'Servicing',
        stop: 'Stop',
      },
      es: {
        next: 'Próximo',
        back: 'Atrás',
        servicing: 'Servicio',
        stop: 'Parada',
      },
    },
    tripWizard: {
      en: {
        searchFrom: 'From',
        searchTo: 'To',
        scheduleTrip: 'Schedule a Trip',
        saveAddress: 'Save Address',
        addressName: 'Address Nickname',
        favorite: 'Favorite Location',
        selectDate: 'Select a Date',
        time: 'Time',
        now: 'Leave Now (ASAP)',
        leaveBy: 'Leave At',
        arriveBy: 'Arrive By',
        modes: 'Modes of Transportation',
        selectTransportation: 'Schedule a Trip',
        chatbot: 'Where To?',
        selectTrip: 'Select a Trip',
        leave: 'Leave',
        arrive: 'Arrive',
        arriveAt: 'Arrive By',
        direct: 'Direct',
        includesStops: 'Includes Stops',
        mode: 'Mode',
        generatingPlans: 'Generating Plans...',
        schedule: 'Schedule Trip',
        overview: 'Trip Plan Overview',
        transfer: 'transfer',
        roll: 'Roll',
        walk: 'Walk',
        drive: 'Drive',
        wait: 'Wait',
        tripScheduled: 'Trip Scheduled',
        showQR: 'Download the App!',
      },
      es: {
        searchFrom: 'De',
        searchTo: 'hacia',
        scheduleTrip: 'Programar un viaje',
        saveAddress: 'Guardar dirección',
        addressName: 'Apodo de la dirección',
        favorite: 'Ubicación favorita',
        selectDate: 'Seleccionar una Fecha', //✅
        time: 'Tiempo',
        now: 'Salir Ahora', //✅
        leaveBy: 'Salir A', //✅
        arriveBy: 'Llegar antes de', //✅
        modes: 'Modos de Transporte', //✅
        selectTransportation: 'Programar un Viaje',
        chatbot: '¿A dónde?', //✅
        selectTrip: 'Seleccionar un Viaje', //✅
        leave: 'Salir',
        arrive: 'Llegar',
        arriveAt: 'Llegar antes de', //✅
        direct: 'Directo', //✅
        includesStops: 'Incluye paradas',
        mode: 'Modo',
        generatingPlans: 'Generando Planes...', //✅
        schedule: 'Programar viaje',
        overview: 'Descripción General del Plan de Viaje', //✅
        transfer: 'transferencia', //✅
        roll: 'Rollo', //✅
        walk: 'camine',
        drive: 'Drive', //✅
        wait: 'Esperar', //✅
        tripScheduled: 'Viaje Programado', //✅
        showQR: '¡Descarga la aplicación!', //✅
      },
    },
    tripbot: {
      en: {
        greeting: 'Where To?',
        error1:
          'Sorry, the bot is experiencing issues. Please try again later.',
        error2: 'Sorry, I am having trouble. Can you try again?',
      },
      es: {
        greeting: '¿A dónde?', //✅
        error1:
          'Lo siento, el bot está experimentando problemas. Por favor, inténtelo de nuevo más tarde.', //✅
        error2:
          'Lo siento, estoy experimentando problemas. ¿Puedes intentarlo de nuevo?', //✅
      },
    },
    accessibility: {
      en: {
        settings: 'Settings',
        fontSize: 'Font Size',
        medium: 'Medium',
        large: 'Large',
        contrast: 'Contrast',
        letterSpacing: 'Letter Spacing',
        expanded: 'Expanded/Normal',
        cursorSize: 'Cursor Size',
        cursorSizeLarge: 'Large Cursor Size',
      },
      es: {
        settings: 'CONFIGURACIÓN',
        fontSize: 'Tamaño de las Letras', //✅
        medium: 'Medio',
        large: 'Grande',
        contrast: 'Contraste',
        letterSpacing: 'Espaciado de letras',
        expanded: 'Ampliado/Normal',
        cursorSize: 'Tamaño del cursor',
        cursorSizeLarge: 'Tamaño del cursor grande',
      },
    },
    twoFactor: {
      en: {
        title: 'Send Code',
        text: 'How would you like to receive the code?',
        sms: 'Text Me',
        smsMessage: `Please enter the 6 digit code sent to you.`,
        call: 'Call Me',
        callMessage:
          'Wait for the phone call then type the six digit code into the box below.',
        email: 'Email Me',
        emailMessage: `Please enter the 6 digit code sent to the email you provided.`,
        send: 'Send Code',
        verifyTitle: 'Please enter the 6 digit code sent to you.',
        sendAgain: 'Need another 6 digit code?',
        invalidCode: 'Invalid Code',
      },
      es: {
        title: 'Reenviar codigo', //✅
        text: '¿Cómo le gustaría recibir el código?',
        sms: 'Envíame un mensaje de texto',
        smsMessage: `Ingrese el código de 6 dígitos que se le envió.`,
        call: 'Llámame',
        callMessage:
          'Espere la llamada telefónica y luego escriba el código de seis dígitos en el cuadro a continuación.', //✅
        email: 'Envíame un correo electrónico',
        emailMessage: `Ingrese el código de 6 dígitos enviado al correo electrónico que proporcionó.`,
        send: 'Reenviar codigo', //✅
        verifyTitle: 'Ingrese el código de 6 dígitos que se le envió.', //✅
        sendAgain: '¿Necesitas otro código de 6 dígitos?',
        invalidCode: 'Código inválido',
      },
    },

    settingsMenu: {
      en: {
        account: 'Account',
        profile: 'Profile Information',
        caregivers: 'Coordinators',
        dependents: 'Dependents',
        favorites: 'Favorites',
        tripPreferences: 'Trip Preferences',
        settings: 'Settings',
        password: 'Password',
        accessibility: 'Accessibility',
        notifications: 'Notifications',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
      },
      es: {
        account: 'Cuenta',
        profile: 'Información del Perfil', //✅
        caregivers: 'Coordinators',
        dependents: 'Dependientes',
        favorites: 'Favoritos',
        tripPreferences: 'Preferencias de Viaje',
        settings: 'CONFIGURACIÓN', //✅
        password: 'Contraseña',
        accessibility: 'Accesibilidad',
        notifications: 'Notificaciones',
        terms: 'Condiciones de uso',
        privacy: 'Política de Privacidad', //✅
      },
    },
    settingsProfile: {
      en: {
        name: 'Name',
        editProfile: 'Edit Profile',
        deleteAccount: 'Delete Account',
        deleteMyAccount: 'Delete My Account',
        confirmDeleteMessage:
          'Are you sure you would like to delete your account?',
        homeAddress: 'Home Address',
      },
      es: {
        name: 'Nombre',
        editProfile: 'Editar Perfil',
        deleteAccount: 'Eliminar cuenta',
        deleteMyAccount: 'Eliminar mi cuenta',
        confirmDeleteMessage:
          '¿Está seguro(a) de que quieres eliminar tu cuenta?',
        homeAddress: 'Dirección del hogar', //✅
      },
    },
    settingsCaregivers: {
      en: {
        inviteCaregiver: 'Invite a Coordinator',
        addCaregiver: 'Add a Coordinator',
        invalidCaregiver: 'Invalid Coordinator',
        linkMessage:
          'You have been requested to be a coordinator for %{name}. Do you want to accept the request?',
        linkMessageNoAccount: `You have been requested to be a coordinator for All Access
        App. Please login to view the request. If you do not have an
        account, please register and you can review the request once
        you complete the registration.`,
        pending: 'Pending',
        received: 'Received',
        denied: 'Denied',
        approve: 'Approve',

        deny: 'Deny',
        acceptRequest: 'Accept Request',
        denyRequest: 'Deny Request',
        removeCaregiver: 'Remove this Coordinator',
        remove: 'Remove',
        confirmRemove: 'Are you sure you want to remove this coordinator?',

        caregiverAlreadyRegistered:
          'This email is already registered as a coordinator.',
        inviteError: 'There was an error inviting the coordinator.',
        genericError: 'Unknown Error',

        statusMessage: 'Coordinator status %{status}',
      },
      es: {
        inviteCaregiver: 'Invitar a un Coordinador', //✅
        addCaregiver: 'Invitar a un Coordinador',
        invalidCaregiver: 'Cuidador inválido',
        linkMessage:
          'Se le ha solicitado que sea coordinator(a) de %{name}. ¿Quieres aceptar la solicitud?', //✅
        linkMessageNoAccount: `Se le ha solicitado que sea coordinador de la aplicación Buffalo Complete Trip. Inicie sesión para ver la solicitud. Si no tiene una cuenta, regístrese y podrá revisar la solicitud una vez se registre.`, //✅
        pending: 'Pendiente',
        received: 'RECIBIDO', //✅
        denied: 'Negado', //✅
        approve: 'Aprobar', //✅
        deny: 'Negar', //✅
        acceptRequest: 'Aceptar Solicitud', //✅
        denyRequest: 'Negar Solicitud', //✅
        removeCaregiver: 'Eliminar a este coordinador', //✅
        remove: 'Eliminar',
        confirmRemove: '¿Está seguro de que desea eliminar a este coordinador?',

        caregiverAlreadyRegistered:
          'Este correo electrónico ya está registrado como cuidador.',
        inviteError: 'Hubo un error al invitar al cuidador.',
        genericError: 'Error desconocido',

        statusMessage: 'Estado del cuidador %{status}',
      },
    },
    settingsDependents: {
      en: {
        upcoming: 'Upcoming Traveler Trips',
        noTrips: 'No trips found',
        list: 'Travelers List',
        tracking: "Tracking %{name}'s Trip",
      },
      es: {
        upcoming: 'Próximos viajes dependientes',
        noTrips: 'No se encontraron viajes',
        list: 'Viajeros',
        trackingTrip: 'Seguimiento del viaje de %{name}',
      },
    },
    settingsFavorites: {
      en: {
        favorites: 'Favorite Trips',
        // noFavorites: 'No favorite trips found.',
        locations: 'Favorite Locations',
        // noLocations: 'No favorite locations found.',
        delete: 'Delete Favorite',
      },
      es: {
        favorites: 'Viajes favoritos',
        // noFavorites: 'No se encontraron viajes favoritos.',
        locations: 'Ubicaciones favoritas',
        // noLocations: 'No se encontraron ubicaciones favoritas.',
        delete: 'Eliminar Favorito', //✅
      },
    },
    settingsPreferences: {
      en: {
        wheelchair: 'Wheelchair Accessible',
        serviceAnimal: 'Service Animal',
        minimizeWalking: 'Minimize Walking',
        maximumTransfers: 'Max Transfers',
        transfers: 'transfers',
        modes: 'Modes of Transportation',
        car: 'Car',
        bicycle: 'Bike',
        bus: 'Bus',
        tram: 'Metro Rail',
        hail: 'Community Shuttle',
      },
      es: {
        wheelchair: 'Accesibilidad para Sillas de Ruedas',
        serviceAnimal: 'Animal de servicio',
        minimizeWalking: 'Minimice la Distancia a Pie', //✅
        maximumTransfers: 'Transferencias máximas',
        transfers: 'transferencias', //✅
        modes: 'Modos de Transporte', //✅
        car: 'automóvil', //✅
        bicycle: 'bicicleta', //✅
        bus: 'autobús', //✅
        tram: 'Metro Rail', //✅
        hail: 'Transporte comunitario',
      },
    },
    settingsPassword: {
      en: {
        password: 'Password',
        placeholder: 'Password',
        error: 'Error updating password',
        success: 'Password updated successfully',
        hide: 'Hide Password',
        show: 'Show Password',
        errorMatch: 'Passwords do not match',
        errorSame: 'New password cannot be the same as the current password',
        current: 'Current Password',
        enter: 'Enter a New Password',
        newPassword: 'New Password',
        reEnter: 'Re-enter New Password',
        characters: 'Characters',
        uppercase: 'Uppercase',
        lowercase: 'Lowercase',
        number: 'Number',
        submit: 'Change Password',
      },
      es: {
        password: 'Contraseña',
        placeholder: 'Ingrese una contraseña de 8 caracteres',
        error: 'Error al actualizar la contraseña', //✅
        success: 'Contraseña actualizada exitosamente', //✅
        hide: 'Ocultar Contraseña',
        show: 'Mostrar Contraseña', //✅
        errorMatch: 'Las contraseñas no coinciden', //✅
        errorSame:
          'La nueva contraseña no puede ser la misma que la contraseña actual', //✅
        current: 'Contraseña actual',
        enter: 'Introduzca una Nueva Contraseña', //✅
        newPassword: 'Nueva contraseña',
        reEnter: 'Vuelva a ingresar la nueva contraseña',
        characters: 'caracteres', //✅
        uppercase: 'mayúsculas',
        lowercase: 'minúsculas',
        number: 'Número',
        submit: 'Cambiar Contraseña', //✅
      },
    },
    settingsAccessibility: {
      en: {
        directions: 'Navigation Directions',
        voiceOn: 'Voice On',
        voiceOff: 'Voice Off',
        language: 'Display Language',
        push: 'Push',
        sms: 'SMS',
        voice: 'Phone',
      },
      es: {
        directions: 'Direcciones de navegación',
        voiceOn: 'Activar Voz',
        voiceOff: 'Desactivar Voz',
        language: 'Idioma de visualización',
        push: 'Push',
        sms: 'SMS',
        voice: 'Teléfono', //✅
      },
    },
    settingsNotifications: {
      en: {
        type: 'Notification Preference Type',
        rider: 'Traveler Notification Alerts',
        tripStart: 'Trip Start',
        transitArrive: 'Transit Arrival',
        transitDelay: 'Mass Transit Delay',
        shuttleArrive: 'On Demand Shuttle Arrival',
        intersection: 'Enhanced Intersection Information',
        caregiverAlerts: 'Coordinator Notification Alerts',
        dependentTripStart: 'Trip Start',
        dependentArriveDepart: 'Traveler Arrival/Departure',
        dependentShuttleArriveDepart: 'Traveler Shuttle Arrival/Drop Off',
        dependentModeChange: 'Traveler Transportation Mode Change',
      },
      es: {
        type: 'Tipo de Preferencia de Notificación',
        rider: 'AAlertas de notificación del pasajero',
        tripStart: 'Inicio del Viaje', //✅
        transitArrive: 'Llegada del Transporte Público', //✅
        transitDelay: 'Retraso en el Transporte Público', //✅
        shuttleArrive: 'Llegada del Autobús',
        intersection: 'Información de Intersección', //✅
        caregiverAlerts: 'Alertas de Notificación al Coordinador', //✅
        dependentTripStart: 'Inicio del Viaje del Viajero', //✅
        dependentArriveDepart: 'Llegada/salida del Viajero',
        dependentShuttleArriveDepart:
          'Llegada/Desembarque del Viajero en Autobús',
        dependentModeChange: 'Cambio de Modo de Transporte del Viajero',
      },
    },
    settingsTerms: {
      en: {
        title: 'Terms of Use',
      },
      es: {
        title: 'Condiciones de uso',
      },
    },
    settingsPrivacy: {
      en: {
        title: 'Privacy Policy',
        content: `Privacy Policy We respect your privacy and are committed to protecting it. This Privacy Policy explains what information we collect, how we use it, and how you can control it.

        Information Collection
        
        We collect information that you provide to us directly, such as when you create an account, place an order, or contact us with a question or concern. This information may include your name, email address, and other contact information.
        
        We may also automatically collect certain information about your use of our services, such as your browsing and search history, device information, and location data. This information is collected through the use of cookies and other technologies.
        
        Information Use
        
        We use the information we collect to provide and improve our services, and to communicate with you. For example, we may use your email address to send you updates on your order or to respond to your customer service inquiries.
        
        We may also use the information we collect to personalize your experience on our website and to send you targeted marketing communications.
        
        Information Control
        
        You have the right to access and control your personal information. You can request access to your information, update your information, or ask us to delete it by contacting us at privacy@example.com.
        
        You can also control the use of cookies and other technologies through your browser settings.
        
        Changes to this Privacy Policy
        
        We may update this Privacy Policy from time to time. If we make any changes, we will notify you by revising the date at the top of this policy and, in some cases, provide you with additional notice (such as adding a statement to our homepage or sending you an email notification).
        
        Contact Us
        
        If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at privacy@example.com.`,
      },
      es: {
        title: 'Política de Privacidad',
        content: `
        TBD
        `,
      },
    },
    tripLog: {
      en: {
        title: 'Activity',
        upcoming: 'UPCOMING TRIPS',
        noTrips: 'No upcoming trips found.',
        viewDetails: 'View Trip Details',
        tripInfo: 'Trip Information',
        viewAll: 'View All Trips',
      },
      es: {
        title: 'Actividad', //✅
        upcoming: 'PRÓXIMOS VIAJES', //✅
        noTrips: 'No se encontraron viajes próximos.',
        viewDetails: 'Ver Detalles del Viaje', //✅
        tripInfo: 'Información del Viaje', //✅
        viewAll: 'Ver Todos los Viajes', //✅
      },
    },
  };
}
