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
        feb: 'Febraury',
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
      },
      es: {
        jan: 'Enero',
        feb: 'Febrero',
        mar: 'Marzo',
        apr: 'Abril',
        may: 'Mayo',
        jun: 'Junio',
        jul: 'Julio',
        aug: 'Agosto',
        sep: 'Septiembre',
        oct: 'Octubre',
        nov: 'Noviembre',
        dec: 'Diciembre',
        janAbr: 'enero',
        febAbr: 'feb',
        marAbr: 'mar',
        aprAbr: 'abr',
        mayAbr: 'mayo',
        junAbr: 'jun',
        julAbr: 'jul',
        augAbr: 'agoto',
        sepAbr: 'set',
        octAbr: 'oct',
        novAbr: 'nov',
        decAbr: 'dic',
        mon: 'LUN',
        tue: 'MAR',
        wed: 'MIÉ',
        thu: 'JUE',
        fri: 'VIE',
        sat: 'SÁB',
        sun: 'DOM',
      },
    },
    global: {
      en: {
        name: 'name',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        save: 'Save',
        cancel: 'Cancel',
        home: 'Home',
        trips: 'Trips',
        profileSettings: 'Profile and Settings',
        accessibility: 'Accessibility',
        favorite: 'Favorite',
        next: 'Next',
        yes: 'Yes',
        no: 'No',
        loading: 'Loading',
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',
      },
      es: {
        name: 'nombre',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        save: 'Guardar',
        cancel: 'Cancelar',
        home: 'Casa',
        trips: 'Viajes',
        profileSettings: 'Perfil y ajustes',
        accessibility: 'Accesibilidad',
        favorite: 'Favorito',
        next: 'Próximo',
        yes: 'Sí',
        no: 'No',
        loading: 'Cargando',
        prevMonth: 'Mes anterior',
        nextMonth: 'Próximo mes',
      },
    },
    navbar: {
      en: { logout: 'Logout', loginSignUp: 'Login/Sign Up' },
      es: {
        logout: 'Cerrar sesión',
        loginSignUp: 'Iniciar sesión/Registrarse',
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
        home: 'Incio',
        trips: 'Viajes',
        map: 'Mapa',
        profile: 'Perfil y ajustes',
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
        letterSpacing: 'Letter Spacing',
        expanded: 'Expanded',
        normal: 'Normal',
        cursorSize: 'Cursor Size',
        largeCursor: 'Larger Cursor Size',
      },
      es: {
        settings: 'Ajustes',
        fontSize: 'Tamaño de fuente',
        medium: 'Medio',
        large: 'Grande',
        contrast: 'Contraste',
        letterSpacing: 'Espaciado de letras',
        expanded: 'Expandido',
        normal: 'Normal',
        cursorSize: 'Tamaño del cursor',
        largeCursor: 'Tamaño del cursor grande',
      },
    },
    loginWizard: {
      en: {
        login: 'Login',
        signUp: 'Sign Up',
        continueGuest: 'Continue as Guest',
        email: 'Email address',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        noAccount: 'Don’t have an account?',
        createAccount: 'Create Account',
      },
      es: {
        login: 'Iniciar sesión',
        signUp: 'Regístrate',
        continueGuest: 'Continuar como invitado',
        email: 'Correo electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidó su contraseña?',
        noAccount: '¿No tienes una cuenta?',
        createAccount: 'Crear cuenta',
      },
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
        tripButton: 'Start Trip',
        tripName: 'Trip Name',
        saveFavorite: 'Save as Favorite',
      },
      es: {
        tripButton: 'Comenzar Viaje',
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
      },
      es: {
        searchTitle: 'Encuentra rutas cercanas',
        searchPlaceholder: 'Comience a escribir una dirección...',
        zoomIn: 'Acercar',
        zoomOut: 'Alejar',
        location: 'Encuentra mi ubicación',
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
        settings: 'Ajustes',
        fontSize: 'Tamaño de fuente',
        medium: 'Medio',
        large: 'Grande',
        contrast: 'Contraste',
        letterSpacing: 'Espaciado de letras',
        expanded: 'Expandido/Normal',
        cursorSize: 'Tamaño del cursor',
        cursorSizeLarge: 'Tamaño del cursor grande',
      },
    },
    twoFactor: {
      en: {
        title: 'Get Authentication Code',
        text: 'To proceed please choose a method for receiving your authentication code.',
        sms: 'Text Me',
        smsMessage: `Check your phone for the six-digit
        verification code and enter it below. You can copy and
        paste the code into the first box.`,
        call: 'Call Me',
        callMessage:
          'Wait for the phone call then type the six digit code into the box below.',
        email: 'Email Me',
        emailMessage: `Check your email for the six-digit
        verification code and enter it below. You can copy and
        paste the code into the first box.`,
        send: 'Send Authentication Code',
        verify: 'Enter the Verification Code',
        sendAgain: 'Send Another Code?',
      },
      es: {
        title: 'Obtener código de autenticación',
        text: 'Para continuar, elija un método para recibir su código de autenticación.',
        sms: 'Envíame un mensaje de texto',
        smsMessage: `Revise su teléfono para el código de verificación de seis dígitos y escríbalo a continuación. Puede copiar y pegar el código en el primer cuadro.`,
        call: 'Llámame',
        callMessage:
          'Espere la llamada telefónica y luego escriba el código de seis dígitos en el cuadro a continuación.',
        email: 'Envíame un correo electrónico',
        emailMessage: `Revise su correo electrónico para el código de verificación de seis dígitos y escríbalo a continuación. Puede copiar y pegar el código en el primer cuadro.`,
        send: 'Enviar código de autenticación',
        verify: 'Ingrese el código de verificación',
        sendAgain: '¿Enviar otro código?',
      },
    },
    routes: {},
    settingsMenu: {
      en: {
        account: 'Account',
        profile: 'Profile Information',
        caregivers: 'Caregivers',
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
        profile: 'Información del perfil',
        caregivers: 'Cuidadores',
        dependents: 'Dependientes',
        favorites: 'Favoritos',
        tripPreferences: 'Preferencias de viaje',
        settings: 'Ajustes',
        password: 'Contraseña',
        accessibility: 'Accesibilidad',
        notifications: 'Notificaciones',
        terms: 'Términos de uso',
        privacy: 'Política de privacidad',
      },
    },
    settingsProfile: {
      en: {
        name: 'Name',
        editProfile: 'Edit Profile',
        deleteAccount: 'Delete Account',
        deleteMyAccount: 'Delete My Account',
        confirmDeleteMessage:
          'Are you sure you would like to delete your account? If you do this, you will need create an new account again for access.',
      },
      es: {
        name: 'Nombre',
        editProfile: 'Editar perfil',
        deleteAccount: 'Eliminar cuenta',
        deleteMyAccount: 'Eliminar mi cuenta',
        confirmDeleteMessage:
          '¿Estás seguro de que te gustaría eliminar tu cuenta? Si haces esto, deberás crear una nueva cuenta para acceder.',
      },
    },
    settingsCaregivers: {
      en: {
        inviteCaregiver: 'Invite Caregiver',
        addCaregiver: 'Add Caregiver',
        removeCaregiver: 'Remove Caregiver',
      },
      es: {
        inviteCaregiver: 'Invitar cuidador',
        addCaregiver: 'Agregar cuidador',
        removeCaregiver: 'Eliminar cuidador',
      },
    },
    settingsDependents: {
      en: {
        upcoming: 'Upcoming Dependent Trips',
        noTrips: 'No trips found',
        list: 'Dependents List',
      },
      es: {
        upcoming: 'Próximos viajes dependientes',
        noTrips: 'No se encontraron viajes',
        list: 'Lista de dependientes',
      },
    },
    settingsFavorites: {
      en: {
        favorites: 'Favorite Trips',
        noFavorites: 'No favorite trips found.',
        locations: 'Favorite Locations',
        delete: 'Delete Favorite',
      },
      es: {
        favorites: 'Viajes favoritos',
        noFavorites: 'No se encontraron viajes favoritos.',
        locations: 'Ubicaciones favoritas',
        delete: 'Eliminar favorito',
      },
    },
    settingsPreferences: {
      en: {
        wheelchair: 'Wheelchair Accessible',
        serviceAnimal: 'Service Animal',
        minimizeWalking: 'Minimize Walking',
        maximumTransfers: 'Maximum Transfers',
        transfers: 'transfers',
        modes: 'Preferred Mode(s) of Transportation',
        car: 'Car',
        bicycle: 'Bike',
        bus: 'Bus',
        tram: 'Rail',
        hail: 'Community Shuttle',
      },
      es: {
        wheelchair: 'Accesible para silla de ruedas',
        serviceAnimal: 'Animal de servicio',
        minimizeWalking: 'Minimizar caminar',
        maximumTransfers: 'Transferencias máximas',
        transfers: 'transferencias',
        modes: 'Modo(s) de transporte preferido(s)',
        car: 'Coche',
        bicycle: 'Bicicleta',
        bus: 'Autobús',
        tram: 'Tren',
        hail: 'Transporte comunitario',
      },
    },
    settingsPassword: {
      en: {
        password: 'Password',
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
        error: 'Error al actualizar la contraseña',
        success: 'Contraseña actualizada con éxito',
        hide: 'Ocultar contraseña',
        show: 'Mostrar contraseña',
        errorMatch: 'Las contraseñas no coinciden',
        errorSame:
          'La nueva contraseña no puede ser igual que la contraseña actual',
        current: 'Contraseña actual',
        enter: 'Ingrese una nueva contraseña',
        newPassword: 'Nueva contraseña',
        reEnter: 'Vuelva a ingresar la nueva contraseña',
        characters: 'Caracteres',
        uppercase: 'Mayúsculas',
        lowercase: 'Minúsculas',
        number: 'Número',
        submit: 'Cambiar contraseña',
      },
    },
    settingsAccessibility: {
      en: {
        directions: 'Navigation Directions',
        voiceOn: 'Voice On',
        voiceOff: 'Voice Off',
        language: 'Display Language',
        push: 'Push Notifications',
        sms: 'SMS',
        voice: 'Phone Call',
      },
      es: {
        directions: 'Direcciones de navegación',
        voiceOn: 'Voz activada',
        voiceOff: 'Voz desactivada',
        language: 'Idioma de visualización',
        push: 'Notificaciones push',
        sms: 'SMS',
        voice: 'Llamada telefónica',
      },
    },
    settingsNotifications: {
      en: {
        type: 'Notification Preference Type',
        settings: 'Settings',
        rider: 'Rider Notification Alerts',
        tripStart: 'Trip Start',
        transitArrive: 'Transit Arrival',
        transitDelay: 'Mass Transit Delay',
        shuttleArrive: 'On Demand Shuttle Arrival',
        intersection: 'Enhanced Intersection Information',
        caregiverAlerts: 'Caregiver Notification Alerts',
        dependentTripStart: 'Trip Start',
        dependentArriveDepart: 'Rider Arrival/Departure',
        dependentShuttleArriveDepart: 'Rider Shuttle Arrival/Drop Off',
        dependentModeChange: 'Rider Transportation Mode Change',
      },
      es: {
        type: 'Tipo de preferencia de notificación',
        settings: 'Ajustes',
        rider: 'Alertas de notificación del pasajero',
        tripStart: 'Inicio del viaje',
        transitArrive: 'Llegada del tránsito',
        transitDelay: 'Retraso del transporte masivo',
        shuttleArrive: 'Llegada del autobús bajo demanda',
        intersection: 'Información mejorada de la intersección',
        caregiverAlerts: 'Alertas de notificación del cuidador',
        dependentTripStart: 'Inicio del viaje del pasajero',
        dependentArriveDepart: 'Llegada/salida del pasajero',
        dependentShuttleArriveDepart:
          'Llegada/drop off del autobús del pasajero',
        dependentModeChange: 'Cambio de modo de transporte del pasajero',
      },
    },
    settingsTerms: {
      en: {
        title: 'Terms of Use',
        content: 'Terms of Use content',
      },
      es: {
        title: 'Términos de uso',
        content: 'Contenido de términos de uso',
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
        title: 'Política de privacidad',
        content: `
        TBD
        `,
      },
    },
    tripLog: {
      en: {
        title: 'Trip Activity',
        upcoming: 'Upcoming',
        addFavorite: 'Add to Favorites',
        removeFavorite: 'Remove from Favorites',
        viewDetails: 'View Trip Details',
      },
      es: {
        title: 'Actividad del Viaje',
        upcoming: 'Próximos',
        addFavorite: 'Agregar a favoritos',
        removeFavorite: 'Eliminar de favoritos',
        viewDetails: 'Ver detalles del viaje',
      },
    },
  };
}
