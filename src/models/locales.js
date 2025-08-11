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
        wed: 'mié',
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
        finish: 'Finish',
        submit: 'Submit',
        cancel: 'Cancel',
        close: 'Close',
        home: 'Home',
        trips: 'Trips',
        profileSettings: 'Profile and Settings',
        accessibility: 'Accessibility',
        feedback: 'Feedback',
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
        finish: 'Finalizar',
        submit: 'Enviar',
        cancel: 'Cancelar',
        close: 'Cerrar',
        home: 'Hogar', //✅
        trips: 'Viajes', //✅
        profileSettings: 'Perfil y configuración', //✅
        accessibility: 'Accesibilidad',
        feedback: 'Comentario', //✅
        favorite: 'Favorito',
        next: 'Próximo',
        prev: 'Anterior', //✅
        skip: 'Saltar', //✅
        yes: 'Sí',
        no: 'No',
        to: 'Hacia', //✅
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
        createAccount: 'Create an Account',
        toggle: 'Toggle Navigation Menu',
      },
      es: {
        logout: 'Cerrar sesión',
        loginSignUp: 'Iniciar sesión/Registrarse',
        createAccount: 'Crear una cuenta',
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
        feedback: 'Feedback',
        help: 'Help'
      },
      es: {
        home: 'Página Principal', //✅
        trips: 'Viajes',
        map: 'Mapa',
        profile: 'Perfil y configuración', //✅
        accessibility: 'Accesibilidad',
        feedback: 'Comentario', //✅
        help: 'Ayuda'
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
    feedbackWidget: {
      en: {
        title: 'Feedback',
        categories: {
          scheduling: "Trip Scheduling",
          hds: "Community Shuttle",
          sds: "Autonomous Bus",
          intersections: "Smart Intersections",
          transit: "Transit",
          outdoorNavigation: "Outdoor Navigation",
          indoorNavigation: "Indoor Navigation",
          caregiver: "Coordinator and Traveler",
          accessibility: "Accessibility",
          mapping: "General Mapping",
          other: "Other"
        },
        checkbox: "Include my email address for follow-up if needed",
        confirmationTitle: "Thank You!",
        confirmationMessage: "Your feedback has been submitted successfully. We appreciate your input and will review it soon.",
        dismiss: "Dismiss",
      },
      es: {
        title: 'Comentario', //✅
        categories: {
          scheduling: "Programación de viajes",
          hds: "Transporte Comunitario NFTA",
          sds: "Autobús Autónomo UB",
          intersections: "Intersecciones inteligentes",
          transit: "Tránsito (autobús, ferrocarril)",
          outdoorNavigation: "Navegación al aire libre",
          indoorNavigation: "Navegación interior",
          caregiver: "Coordinador y Viajero",
          accessibility: "Accesibilidad",
          mapping: "Mapeo general",
          other: "Otro"
        },
        checkbox: "Incluya mi dirección de correo electrónico para seguimiento si es necesario.",
        confirmationTitle: "¡Gracias!",
        confirmationMessage: "Su comentario ha sido enviado exitosamente. Apreciamos su opinión y la revisaremos pronto.",
        dismiss: "Descartar",
      }
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
        // addMobilityOptionsDescription: `Enter in your email to find enhanced mobility options you are registered with such as [x]`,

        // addAnotherEmail: 'Add Another email address',

        // termsTitle: 'Terms and Conditions',
        termsMessage: 'I agree to the Terms and Conditions',
        // termsText: "Please read the following to learn about the All Access App terms and conditions which apply to your use of our website, product, services, and mobile application in regard to the certain Buffalo All Access complete trip deployment project (Buffalo Access) (collectively, the \"Services\"). Do not use this website or application unless you have read these terms and accept that they will govern your right to use and access our Services.",
        // availability: "Availability",
        // availabilityText: "Through your use of the Services, Buffalo Access shall be made available to you in connection with traveling to, from, and within and around the Buffalo Niagara Medical Campus. Redistribution or republication of any part of Buffalo Access or its content is prohibited. Buffalo Access, to the extent permitted by law, including, but not limited to, Title VI of the Civil Rights Act of 1964, as amended, reserves the right to refuse any or all of its Services to anyone. Buffalo Access reserves the right to investigate and take action, including the removal of a user’s records in response to allegations of misconduct or illegal activity.",
        // privacy: "Privacy",
        // privacyText: "By using or accessing our Services in any manner, or by otherwise providing us with Personal Information (defined below), you acknowledge that you accept the practices and policies outlined in these terms and conditions, as the same may be amended by us from time to time. Buffalo Access gathers various types of Personal Information from users to be used intentionally in connection with providing our Services to allow you to set up a user account and profile, to contact you, to fulfill your requests for certain products and Services, to analyze how you use the Services, and to provide you with comprehensive trip planning and execution support based on your preferences and accessibility-related needs. Buffalo Access receives and stores any information you knowingly provide. For example, through the registration process and/or through your account settings, Buffalo Access may collect Personal Information such as your name, email address, and phone number (the \"Personal Information\"). Before your data is stored, the data will be anonymized and encrypted to maintain security and protect privacy.\n\nWhenever you interact with our Services, Buffalo Access automatically receives and records information on our server logs from your browser or device, which may include your IP address, device identification, \"cookie\" information, the type of browser and/or device you’re using to access our Services, and the page or feature you requested. \"Cookies\" are identifiers we transfer to your browser or device that allow us to recognize your browser or device and tell us how and when pages and features in our Services are visited and by how many people. You may be able to change the preferences on your browser or device to prevent or limit your device’s acceptance of cookies, but this may prevent you from taking advantage of some or all of our features.",
        // changesToApp: "Changes to Buffalo Access",
        // changesToAppText: "Buffalo Access may terminate, change, suspend or discontinue any aspect of its Services, including removing, adding, modifying or otherwise changing any features and/or content at any time without notice or liability. Buffalo Access reserves the right, but shall not be obligated, to correct any errors or omissions in any portion of Buffalo Access at any time without notice to any Buffalo Access user or third party linked to the website or application.",
        // changesToTerms: "Changes to Terms and Conditions",
        // changesToTermsText: "Buffalo Access reserves the right to change these Terms and Conditions from time to time as it sees fit.",
        terms1: 'I agree to the',
        terms2: 'terms and conditions',
        accept: 'Accept',
        decline: 'Decline',

        haveAccount: 'Already have an account?',
        "header": "Terms and Conditions",
        "headerText": "Please read the following to learn about the All Access App terms and conditions which apply to your access and use of our website, product, services, and mobile application (i.e., the All Access App) in regard to the certain Buffalo All Access complete trip deployment project (“Buffalo Access”) (collectively, the “Services”). By using, accessing, and/or downloading the Services (including, but not limited to the All Access App), you acknowledge that you have read, understood, and agreed to be legally bound by the terms and conditions set forth herein (the “Terms and Conditions”) which will govern your right to use and access our Services.",
        "availability": "Availability",
        "availabilityText": "Through your use of the Services, Buffalo Access shall be made available to you in connection with traveling to, from, and within and around the Buffalo Niagara Medical Campus. Redistribution or republication of any part of Buffalo Access, the Services, or any content thereof, is prohibited. Buffalo Access, to the extent permitted by law, including, but not limited to, Title VI of the Civil Rights Act of 1964, as amended, reserves the right to refuse any or all of its Services to anyone. Buffalo Access reserves the right to investigate and take action, including, but not limited to, the removal of a user's records, the cancellation of a user's account, and/or suspension or termination of a user's access to or use of any or all of the Services in response to allegations of misconduct or illegal activity. \n\nBuffalo Access is affiliated with the Niagara Frontier Transportation Authority, University at Buffalo, Buffalo Niagara Medical Campus Inc., and their officers, directors, and representatives (collectively referred to as \"Affiliated Groups\", \"our,\" \"us\" or \"we\").",
        "liability": "Liability for Access and Use; Prohibited Conduct",
        "liabilityText": "You agree that you are fully responsible for your access to and use of any and all of the Services, together with any and all activities and conduct engaged in by you and/or on your account, as applicable. You agree not to engage in, participate in, aid or assist in any \"Prohibited Conduct\" in connection with your access to or use of any of the Services (defined in this section).  \"Prohibited Conduct\" includes, but is not limited to, any conduct that is unlawful, infringing (e.g., downloading, copying, redistributing, sharing, uploading, or otherwise making use of any copyright protected material, video, audio or otherwise without the owner's permission), tortious conduct that is intentionally harmful to an individual or entity or conduct that negligently or knowingly puts an individual or entity at risk, or any other conduct that a reasonable individual would or should know would violate another party's intellectual property rights, privacy rights or other rights; or conduct that otherwise interferes with the operation of, use of, or enjoyment of, any service, system or other property. You shall not use any of the Services, including, but not limited to the All Access App, to engage in any activity which constitutes or is capable of constituting a federal or state criminal offense. You shall not access or use any of the Services for commercial purposes. You agree and acknowledge that we may be required to provide assistance and information to law enforcement, governmental agencies and other authorities from time to time, which may concern your use of any of the Services.",
        "privacy": "Privacy",
        "privacyText": "By using or accessing our Services in any manner, or by otherwise providing us with Personal Information (defined below), you acknowledge that you accept the practices and policies outlined in the certain corresponding consent form that you have completed in connection with your access and use of the Services, and as may be further outlined in these Terms and Conditions, as the same may be amended by us from time to time. You acknowledge and agree that Buffalo Access gathers various types of Personal Information from users of the Services to be used intentionally in connection with providing our Services through Buffalo Access to allow you to set up a user account and profile, to contact you, to fulfill your requests for certain products and Services, to analyze how you use the Services, and to provide you with comprehensive trip planning and execution support based on your preferences and accessibility-related needs, and you consent to the same, which may also include location-based data as needed from time to time to provide certain of the Services to you. Buffalo Access receives and stores any information you knowingly provide. For example, through the registration process and/or through your account settings, Buffalo Access may collect Personal Information, which shall include, but not necessarily be limited to, your name, email address, and phone number (the \"Personal Information\"). Before your data are stored, the data will be anonymized and encrypted in accordance with our standard privacy protocols and policies to maintain security and protect privacy.\n\nWhenever you interact with our Services, Buffalo Access automatically receives and records information on our server logs from your browser or device, which may include your IP address, device identification, “cookie” information, the type of browser and/or device you’re using to access our Services, and the page or feature you requested. “Cookies” are identifiers we transfer to your browser or device that allow us to recognize your browser or device and tell us how and when pages and features in our Services are visited and by how many people. You may be able to change the preferences on your browser or device to prevent or limit your device’s acceptance of cookies, but this may prevent you from taking advantage of some or all of our features or Services.",
        "changesToApp": "Changes to Buffalo Access",
        "changesToAppText": "Buffalo Access may terminate, change, suspend or discontinue any aspect of its Services, including removing, adding, modifying or otherwise changing any features and/or content at any time without notice or liability. Buffalo Access reserves the right, but shall not be obligated, to correct any errors or omissions in any portion of Buffalo Access at any time without notice to any Buffalo Access user or third party linked to the website or application.",
        "ownership": "Ownership of Intellectual Property",
        "ownershipText": "The Services, including, but not limited to the All Access App or website, may contain services, software code, content, graphics, logos, marks, designs, images or other intellectual property that are owned or licensed by one or more of us, and all right, title and interest in and to the same are reserved by us, as applicable. Unless otherwise specifically permitted by applicable law, you may not copy, share, distribute, reproduce, upload or otherwise make use of such services, software code, content, graphics, logos, marks, designs, images or other intellectual property without  express and prior written permission of the applicable owner(s) thereof. Unless otherwise specifically provided herein, neither your access to nor use of any of the Services, including, but not limited to, the All Access App, shall grant you any right, title or interest in or to any patent, trademark, copyright, or other such intellectual property rights that Buffalo Access, the Affiliated Groups, or others may have in said services, software code, content, graphics, logos, marks, designs, images or other intellectual property.",
        "liabilityLimitation": "Limitation of Liability",
        "liabilityLimitationText": "WE ARE NOT LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, EXEMPLARY, PUNITIVE, SPECIAL OR CONSEQUENTIAL DAMAGES (INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST SAVINGS, LOSS OF GOODWILL, BUSINESS REPUTATION, OR BUSINESS OPPORTUNITIES, OR DAMAGES RESULTING FROM LOST DATA OR BUSINESS INTERRUPTION) RESULTING FROM THE ACCESS OR USE OF, OR INABILITY TO ACCESS OR USE, OUR SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR WEBSITE, APP, CONTENT, OR DATA, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF YOU HAVE NOTIFIED US ABOUT SUCH DAMAGES, OR FOR ANY CLAIMS BY ANY THIRD-PARTIES.\n\nIF APPLICABLE LAW PROHIBITS, OR LIMITS, THE FOREGOING LIMITATIONS SET FORTH ABOVE, AND WE ARE FOUND TO BE LIABLE, IN NO EVENT WILL OUR LIABILITY TO YOU ARISING FROM OR RELATING TO YOUR ACCESS OR USE OF OUR SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR WEBSITE, APP, CONTENT, OR DATA, EXCEED ONE HUNDRED  U.S. DOLLARS ($100.00).\n\nSome states do not allow exclusion of implied warranties or limitation of liability for incidental or consequential damages, so the above limitations or exclusions may not apply to you. In such states, our liability to you shall be limited to the greatest extent permitted by applicable law.",
        "disclaimer": "Disclaimer of Warranties",
        "disclaimerText": "YOUR USE OF THE SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR WEBSITE, APP, CONTENT, OR DATA IS AT YOUR OWN RISK AT ALL TIMES AND YOU AGREE TO ASSUME SUCH RISK. THE SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR WEBSITE, APP, CONTENT, OR DATA, ARE PROVIDED \"AS IS\".\n\nWE HEREBY DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DISCLAIM ALL WARRANTIES RELATING TO THE AVAILABILITY, ACCURACY, SECURITY, PRIVACY, CONFIDENTIALITY, APPROPRIATENESS, RELIABILITY, COMPLETENESS, OR TIMELINESS RELATING TO THE SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR APP, WEBSITE, CONTENT OR DATA. WE DISCLAIM ANY WARRANTY THAT THE SERVICES, INCLUDING, BUT NOT LIMITED TO, OUR WEBSITE, APP, CONTENT, OR DATA, WILL BE UNINTERRUPTED, FREE OF VIRUSES OR OTHER MALWARE, NOT DELAYED OR SUSPENDED, UNCHANGED, OR ERROR FREE OR THAT WE WILL CORRECT ANY DEFECTS.",
        "indemnification": "Indemnification",
        "indemnificationText": "You agree to indemnify and hold harmless Buffalo Access, the Affiliated Groups, and all of their respective officers, directors, members, shareholders, trustees, employees, agents, and representatives from and against any and all claims, demands, liabilities, losses, damages, judgements, settlements, costs or expenses, including attorneys' fees, arising out of or resulting from your acts, omissions, or breach of any provision of these Terms and Conditions or otherwise arising in any way out of your use of the Services . This section will not be construed to limit or exclude any other claims or remedies that Buffalo Access and/or the Affiliated Groups may assert at law, in equity or otherwise.",
        "miscellaneous": "Miscellaneous",
        "miscellaneousText": "These Terms and Conditions shall be governed, interpreted and construed in accordance with New York State law, without regard to its conflict of laws rules. Any legal suit, action, or proceeding arising out of, or related to, these Terms and Conditions, or your access or use of the Services, shall be instituted exclusively in the federal or state court of competent jurisdiction located in Erie County, New York. You waive any and all objections to the exercise of jurisdiction over you by such courts and to venue in such courts. These Terms and Conditions, together with any other terms, conditions and policies referenced herein, shall constitute the entire agreement between you and us with respect to your access to and/or use of any or all of the Services and the same shall supersede all prior and contemporaneous understandings and agreements, both written and oral, with respect to the subject matter hereof between you and us. If any term or provision contained herein is ruled to be invalid, illegal or unenforceable in any jurisdiction, such invalidity, illegality or unenforceability shall not affect the validity, legality or enforceability of any other term or provision contained herein or invalidate or render unenforceable such term or provision in any other jurisdiction. The headings in these Terms and Conditions are for reference only and shall not affect the interpretation of the terms and conditions contained herein. These Terms and Conditions shall be binding upon and shall inure to the benefit of us and you, and the respective successors and permitted assigns thereof. You may not assign your rights or obligations hereunder without our prior written consent, and any attempt to make an impermissible assignment shall be null and void ab initio. Nothing in these Terms and Conditions shall be construed as conferring upon any person, other than us and you, any rights or benefits hereunder.",
        "changesToTerms": "Changes to Terms and Conditions",
        "changesToTermsText": "We reserve the right to change, amend or otherwise modify these Terms and Conditions from time to time as we see fit.",

        "consent": {
          "title": "Permission to Take Part in a Human Research Study",
          "header": "Consent Form",
          "headerText": "Please review the consent to participate in the evaluation research of the Buffalo NY ITS4US All Access App. The research study was approved by the University at Buffalo Institutional Review Board (UBIRB) (UB Federalwide Assurance ID#: FWA00008824)",
          "info1": "Key Information:",
          "info1Text": "The following is a short summary of this study to help you decide whether or not you would like to participate. More detailed information is provided below.",
          "q1": "Why am I being invited to take part in a research study?",
          "a1": "You are being invited to take part in a research study because you match one or more of the following categories: work and/or travel to the Buffalo Niagara Medical Center; and, at least 18 years of age.",
          "q2": "What should I know about a research study?",
          "a2a": "Whether or not you take part is up to you.",
          "a2b": "You can choose not to take part.",
          "a2c": "You can agree to take part and later change your mind.",
          "a2d": "Your decision will not be held against you.",
          "a2e": "You can ask all the questions you want before you decide.",
          "q3": "Why is this research being done?",
          "a3": "The purpose of this research is to determine the usefulness of three new technologies for improving people’s ability to travel to or from the Buffalo Niagara Medical Center or around their neighborhoods. The four technologies are a trip planning app (Buffalo All Access), a community shuttle service (both human-operated and self-driving), outdoor and indoor route guidance, and safe intersection crossing technology.",
          "q4": "How long will the research last and what will I need to do?",
          "a4": "The research will last about 18 months. You will be asked to complete an introductory survey about your current travel behaviors, followed by three surveys on any changes in your travel behavior and your perceptions of the new technologies. More detailed information about the study procedures can be found under \"What happens if I say yes, I want to be in this research?\"",
          "q5": "Is there any way being in this study could be bad for me?",
          "a5": "The risks to joining this study are minimal. More detailed information about the risks of this study can be found under \"Is there any way being in this study could be bad for me? (Detailed Risks)\"",
          "q6": "Will being in this study help me in any way?",
          "a6": "There may not be a direct benefit to you personally for participating in this study. We cannot promise any benefits to others from your taking part in this research. However, the information you provide will enable further development of these technologies, and others like them, to offer improved travel experiences for people like you.",
          "q7": "What happens if I do not want to be in this research?",
          "a7": "Participation in research is completely voluntary. You may choose not to enroll in this study. Your refusal to participate will involve no penalty or loss of benefits to which you are otherwise entitled.",
          "info2": "Detailed Information:",
          "info2Text": "The following is more detailed information about this study in addition to the information listed above.",
          "q8": "Who can I talk to?",
          "a8a": "If you have questions, concerns, or complaints, or think the research has hurt you, talk to the research team at (716) 829-5902 or email jlmaisel@buffalo.edu. You may also contact the research participant advocate at 716-888-4845 or researchadvocate@buffalo.edu.\n\nThis research has been reviewed and approved by an Institutional Review Board (“IRB”). An IRB is a committee that provides ethical and regulatory oversight of research that involves human subjects. You may talk to them at (716) 888-4888 or email ub-irb@buffalo.edu if:",
          "a8b": "You have questions about your rights as a participant in this research.",
          "a8c": "Your questions, concerns, or complaints are not being answered by the research team.",
          "a8d": "You cannot reach the research team.",
          "a8e": "You want to talk to someone besides the research team.",
          "a8f": "You want to get information or provide input about this research.",
          "q9": "How many people will be studied?",
          "a9": "We expect about 500 people will be in this research study; an initial 100 persons, increasing up to 500 persons as the study progresses.",
          "q10": "What happens if I say yes, I want to be in this research?",
          "a10": "If you choose to participate, you will use the trip planning app (Buffalo All Access), a community shuttle service (both human-operated and self-driving), outdoor and indoor route guidance, and safe intersection crossing technology.\n\nIn addition to using the four technologies, you will be asked to participate in a series of surveys. Each survey will take approximately 15-20 minutes to complete. The surveys will be conducted about every three-six months. You may complete the survey on your mobile device, laptop, desktop computer, or by telephone. The survey consists of questions about (1) your travel behavior, (2) challenges in traveling to or from the BNMC or your neighborhood, (3) use of the deployed technologies, (4) your perceptions of the technologies, and (5) demographic information. Demographic information includes your zip code, name, and contact information. A single question will also be prompted on the app to assess your satisfaction [with the app or the service] after each usage.\n\nIn addition to completing surveys, when you use the trip planning app or the community shuttle service as a participant in the study, passive data will also be captured. Such data will include registration and app usage (e.g., frequency, time of day) as well as trip (e.g., trip planning, trip booking, trip travel mode, shuttle pick-up/drop-off location). Such data will be tied to the survey data via the respondent ID of study participants to protect personally identifiable information and will be collected and stored only for those persons who have consented to be a part of the study. While possible, specific geolocations will not be captured also to protect personally identifiable information.",
          "q11": "What happens if I say yes, but I change my mind later?",
          "a11": "You can leave the research at any time it will not be held against you. If you decide to leave the research, already collected data may not be removed from the study database.",
          "q12": "Is there any way being in this study could be bad for me? (Detailed Risks)",
          "a12": "We are not anticipating any ways in which this study can harm you. The risks for participating in this study are minimal, and are no greater than those which are present in everyday life.\n\nThese minimal risks are primarily associated with use of the self-driving shuttle. While the potential is small, we need to mention them here. With the self-driving shuttle, there could be sudden stops due to the way the technology perceives its surrounding environment as well as the potential for the self-driving shuttle to travel beyond the operating environment for which it is designed. An experienced steward/operator will be on board the self-driving shuttle at all times to ensure safety and assist with any situations that may arise. The self-driving vehicle has been successfully deployed in other locations and tested for safety.",
          "q13": "What happens to the information collected for the research?",
          "a13": "The data collected will be stored in secured servers at the University at Buffalo and will only be accessible to members of the research team and will be password protected. Identities of subjects will be kept confidential. This information will be securely stored in separate password protected files in secured servers.\n\nEfforts will be made to limit the use and disclosure of your personal information to people who have a need to review this information. We cannot promise complete secrecy. Organizations that may inspect and copy your information include the IRB and other representatives of this organization.\n\nThe results of this study may be published in scientific journals, professional publications, or educational presentations. Your name will only be connected to your survey responses through a study ID number and will not be used in any report. The de-identified information collected during the study could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from the participants.",
          "q14": "Can I be removed from the research without my OK?",
          "a14": "You cannot be removed from the research study without your OK.",
          "q15": "What else do I need to know?",
          "q15q1": "Who is paying for this research?",
          "q15a1": "This research is being funded by the U.S. Department of Transportation.",
          "q15q2": "Will I get paid for my participation in this research?",
          "q15a2": "If you agree to take part in this research study, and complete all four surveys, you will be eligible to enter a drawing to receive up to $500. You should plan to complete four surveys over an 18-month period. Payments that you receive for your participation in this research are considered taxable income.",
          "confirm": "PARTICIPANT'S STATEMENT OF INFORMED CONSENT:  \"I am at least 18 years of age, have read and understand the explanation provided to me and voluntarily agree to participate in this study.\" (Clicking the box assumes consent.)"
        },
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
        // addMobilityOptionsDescription: `Ingrese su correo electrónico para encontrar opciones de movilidad mejoradas con las que está registrado, como [x]`,
        // addAnotherEmail: 'Agregar otra dirección de correo electrónico',

        termsTitle: 'Términos y condiciones',
        termsMessage: 'Acepto los Términos y Condiciones',
        termsText: "Lea lo siguiente para conocer los términos y condiciones que aplican al usar nuestro sitio web, productos, servicios y aplicación móvil con respecto al proyecto Buffalo Access (colectivamente, los \"Servicios\"). No utilice este sitio web o aplicación a menos que haya leído estos términos y acepte que estos regirán su derecho a usar y acceder a nuestros Servicios.",
        availability: "Disponibilidad",
        availabilityText: "A través de su uso de los Servicios, Buffalo Access estará disponible para usted en relación con los viajes hacia, desde, dentro y alrededor del Buffalo Niagara Medical Campus. Queda prohibida la redistribución o republicación de cualquier parte de Buffalo Access o de su contenido. Buffalo Access, en la medida en que lo permita la ley, incluido, entre otros, el Título VI de la Ley de Derechos Civiles de 1964, en su versión modificada, se reserva el derecho de denegar cualquiera o todos sus Servicios a cualquier persona. Buffalo Access se reserva el derecho de investigar y tomar medidas, incluida la eliminación de los registros de un usuario, en respuesta a acusaciones de mala conducta o actividad ilegal.",
        privacy: "Privacidad",
        privacyText: "Al usar o acceder a nuestros Servicios de cualquier manera, o al proporcionarnos Información Personal (definida a continuación), usted reconoce que acepta las prácticas y políticas descritas en estos términos y condiciones, ya que los mismos pueden ser modificados por nosotros de vez en cuando. Buffalo Access recopila varios tipos de información personal de los usuarios para utilizarla de forma intencionada en relación con la prestación de nuestros servicios para permitirle configurar su cuenta y perfil de usuario, ponernos en contacto con usted, satisfacer sus solicitudes de determinados productos y servicios, analizar cómo utiliza los servicios y proporcionarle un apoyo integral para la planificación y ejecución de viajes en función de sus preferencias y necesidades de accesibilidad. Buffalo Access recibe y almacena cualquier información que usted proporciona. Por ejemplo, a través del proceso de registro y/o a través de la configuración de su cuenta, Buffalo Access puede recopilar información personal como su nombre, dirección de correo electrónico y número de teléfono (la \"Información personal\"). Antes de que se almacenen sus datos, los datos se anonimizarán y encriptarán para mantener la seguridad y proteger su privacidad.\n\nCada vez que interactúa con nuestros Servicios, Buffalo Access recibe y registra automáticamente información en los registros de nuestro servidor desde su navegador o dispositivo, que puede incluir su dirección IP, identificación del dispositivo, información de \"cookies\", el tipo de navegador y/o dispositivo que está utilizando para acceder a nuestros Servicios y la página o función que solicitó. Las \"cookies\" son identificadores que transferimos a su navegador o dispositivo que nos permiten reconocer su navegador o dispositivo y nos dicen cómo y cuándo se visitan las páginas y funciones de nuestros Servicios y por cuántas personas. Es posible que pueda cambiar las preferencias de su navegador o dispositivo para evitar o limitar la aceptación de cookies por parte de su dispositivo, pero esto puede impedirle aprovechar algunas o todas nuestras funciones.",
        changesToApp: "Cambios en Buffalo Access",
        changesToAppText: "Buffalo Access puede cancelar, cambiar, suspender o interrumpir cualquier aspecto de sus Servicios, incluida la eliminación, adición, modificación o cambio de cualquier característica y/o contenido en cualquier momento sin previo aviso ni responsabilidad. Buffalo Access se reserva el derecho, pero no estará obligado, a corregir cualquier error u omisión en cualquier parte de Buffalo Access en cualquier momento y sin previo aviso a ningún usuario de Buffalo Access o a un tercero vinculado al sitio web o la aplicación.",
        changesToTerms: "Cambios en los Términos y Condiciones",
        changesToTermsText: "Buffalo Access se reserva el derecho de cambiar estos Términos y Condiciones según lo considere oportuno.",
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
      es: {
        message: `Escriba el código de 6 dígitos. El código también se puede pegar en el primer cuadro.`,
        resendCode: 'Enviar otro código',
        invalidCode: 'Código inválido',
      },
    },

    terms: {
      en: {},
      es: {},
    },

    // caregiverLink: {
    //   en: {
    //     description:
    //       'Caregiver Link is a service that connects caregivers with their loved ones.',
    //     login: 'Log In',
    //     signUp: 'Sign Up',
    //     forgotPassword: 'Forgot Password?',
    //   },
    //   es: {
    //     description:
    //       'Enlace de Cuidador es un servicio que conecta a los cuidadores con sus seres queridos.',
    //     login: 'Iniciar sesión',
    //     signUp: 'Regístrate',
    //     forgotPassword: '¿Olvidó su contraseña?',
    //   },
    // },
    home: {
      en: {
        tripButton: 'Plan a Trip',
        tripName: 'Trip Name',
        saveFavorite: 'Save as Favorite',
      },
      es: {
        tripButton: 'Planificar un Viaje',
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
        shuttleNotAvailableTimeFrame: 'Sorry, but this shuttle is not available at this time.'
      },
      es: {
        next: 'Próximo',
        back: 'Atrás',
        servicing: 'Servicio',
        stop: 'Parada',
        shuttleNotAvailableTimeFrame: 'Lo sentimos, pero este autobús no está disponible en este momento.'
      },
    },
    tripWizard: {
      en: {
        searchFrom: 'From',
        searchTo: 'To',
        scheduleTrip: 'Plan a Trip',
        scheduleShuttle: 'Schedule Shuttle',
        saveAddress: 'Save Address',
        addressName: 'Address Nickname',
        favorite: 'Favorite Location',
        selectDate: 'Select a Date',
        time: 'Time',
        when: 'When',
        now: 'Leave Now (ASAP)',
        leaveBy: 'Leave At',
        arriveBy: 'Arrive By',
        modes: 'Modes of Transportation',
        selectTransportation: 'Plan a Trip',
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
        summonShuttle: 'Summon Shuttle',
        noTrips: 'No trips found.',
        popUpTitle: "To summon the shuttle you must provide your PIN and Phone number below.",
        popUpPin: "PIN",
        popUpPhone: "Phone",
        popUpError: "You must provide a valid PIN and phone number.",
        popUpUnknownError: "An unknown error occurred. Please try again.",
        popUpSuccess: "Success! Your shuttle will arrive in about 5 minutes.",
        popUpDirectionsTitle: "Pickup Location:",
        popUpDirectionsImage: "Pickup location photo:",
        popUpSuccessModalTitle: "Shuttle Requested Successfully",
        timeRemaining: {
          zero: "Exiting now...",
          one: "Exiting in 1 second",
          other: "Exiting in %{count} seconds",
        }
      },
      es: {
        searchFrom: 'De',
        searchTo: 'hacia',
        scheduleTrip: 'Planificar un viaje',
        scheduleShuttle: 'Programar autobús',
        saveAddress: 'Guardar dirección',
        addressName: 'Apodo de la dirección',
        favorite: 'Ubicación favorita',
        selectDate: 'Seleccionar una Fecha', //✅
        time: 'Tiempo',
        when: 'Cuándo',
        now: 'Salir Ahora', //✅
        leaveBy: 'Salir A', //✅
        arriveBy: 'Llegar antes de', //✅
        modes: 'Modos de Transporte', //✅
        selectTransportation: 'Planificar un Viaje',
        chatbot: '¿A dónde?', //✅
        selectTrip: 'Seleccionar un Viaje', //✅
        leave: 'Salir',
        arrive: 'Llegar',
        arriveAt: 'Llegar antes de', //✅
        direct: 'Directo', //✅
        includesStops: 'Incluye paradas',
        mode: 'Modo',
        generatingPlans: 'Generando Planes...', //✅
        schedule: 'Planificar viaje',
        overview: 'Descripción General del Plan de Viaje', //✅
        transfer: 'transferencia', //✅
        roll: 'Rollo', //✅
        walk: 'camine',
        drive: 'Conducir', //✅
        wait: 'Esperar', //✅
        tripScheduled: 'Viaje Programado', //✅
        showQR: '¡Descarga la aplicación!', //✅
        summonShuttle: 'Llamar al autobús', //✅
        noTrips: 'No se encontraron viajes.', //✅
        popUpTitle: "Para solicitar el servicio de traslado, debe proporcionar su PIN y número de teléfono a continuación.", //✅
        popUpPin: "PIN", //✅
        popUpPhone: "Teléfono", //✅
        popUpError: "Debe proporcionar un PIN válido y un número de teléfono.", //✅
        popUpUnknownError: "Un error desconocido ocurrió. Inténtalo de nuevo.", //✅
        popUpSuccess: "¡Éxito! Tu transporte llegará en aproximadamente 5 minutos.",
        popUpDirectionsTitle: "Ubicación de recogida:",
        popUpDirectionsImage: "Foto de la ubicación de recogida:",
        popUpSuccessModalTitle: "Transporte Solicitado Exitosamente",
        timeRemaining: {
          zero: "Saliendo ahora...",
          one: "Saliendo en 1 segundo",
          other: "Saliendo en %{count} segundos",
        }
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
        dependents: 'Travelers',
        favorites: 'Favorites',
        tripPreferences: 'Trip Preferences',
        palsDirect: 'NFTA PAL Direct Users',
        settings: 'Settings',
        password: 'Password/PIN',
        accessibility: 'Accessibility',
        notifications: 'Notifications',
        terms: 'Terms and Conditions',
        privacy: 'Privacy Policy',
      },
      es: {
        account: 'Cuenta',
        profile: 'Información del Perfil', //✅
        caregivers: 'Coordinators',
        dependents: 'Viajeros', //✅
        favorites: 'Favoritos',
        tripPreferences: 'Preferencias de Viaje',
        palsDirect: 'Usuarios de NFTA PAL Direct',
        settings: 'CONFIGURACIÓN', //✅
        password: 'Contraseña/PIN',
        accessibility: 'Accesibilidad',
        notifications: 'Notificaciones',
        terms: 'Términos y condiciones',
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
      },
      es: {
        inviteCaregiver: 'Invitar a un Coordinador', //✅
        addCaregiver: 'Invitar a un Coordinador',
        linkMessage:
          'Se le ha solicitado que sea coordinator(a) de %{name}. ¿Quieres aceptar la solicitud?', //✅
        linkMessageNoAccount: `Se le ha solicitado que sea coordinador de la aplicación All Access. Inicie sesión para ver la solicitud. Si no tiene una cuenta, regístrese y podrá revisar la solicitud una vez se registre.`, //✅
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
      },
    },
    settingsDependents: {
      en: {
        upcoming: 'Upcoming Traveler Trips',
        noTrips: 'No trips found',
        list: 'Travelers List',
        trackingTrip: "Tracking %{name}'s Trip",
      },
      es: {
        upcoming: 'Próximos Viajes del Viajero',
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
        ubshuttle: 'UB Shuttle',
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
        ubshuttle: 'Autobús UB',
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
        pinText: 'Use your PIN and phone number to summon shuttles from the kiosks.',
        pin: 'Show/Hide Current PIN',
        submitPin: 'Update PIN',
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
        pinText: 'Utilice su PIN y número de teléfono para solicitar transporte desde los quioscos.', //✅
        pin: 'Mostrar/ocultar PIN actual',
        submitPin: 'Actualizar PIN',
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
        dependentTripStart: 'Traveler Trip Start',
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
        title: 'Terms and Conditions',
        termsText: "Please read the following to learn about the All Access App terms and conditions which apply to your use of our website, product, services, and mobile application in regard to the certain Buffalo All Access complete trip deployment project (Buffalo Access) (collectively, the \"Services\"). Do not use this website or application unless you have read these terms and accept that they will govern your right to use and access our Services.",
        availability: "Availability",
        availabilityText: "Through your use of the Services, Buffalo Access shall be made available to you in connection with traveling to, from, and within and around the Buffalo Niagara Medical Campus. Redistribution or republication of any part of Buffalo Access or its content is prohibited. Buffalo Access, to the extent permitted by law, including, but not limited to, Title VI of the Civil Rights Act of 1964, as amended, reserves the right to refuse any or all of its Services to anyone. Buffalo Access reserves the right to investigate and take action, including the removal of a user’s records in response to allegations of misconduct or illegal activity.",
        privacy: "Privacy",
        privacyText: "By using or accessing our Services in any manner, or by otherwise providing us with Personal Information (defined below), you acknowledge that you accept the practices and policies outlined in these terms and conditions, as the same may be amended by us from time to time. Buffalo Access gathers various types of Personal Information from users to be used intentionally in connection with providing our Services to allow you to set up a user account and profile, to contact you, to fulfill your requests for certain products and Services, to analyze how you use the Services, and to provide you with comprehensive trip planning and execution support based on your preferences and accessibility-related needs. Buffalo Access receives and stores any information you knowingly provide. For example, through the registration process and/or through your account settings, Buffalo Access may collect Personal Information such as your name, email address, and phone number (the \"Personal Information\"). Before your data is stored, the data will be anonymized and encrypted to maintain security and protect privacy.\n\nWhenever you interact with our Services, Buffalo Access automatically receives and records information on our server logs from your browser or device, which may include your IP address, device identification, \"cookie\" information, the type of browser and/or device you’re using to access our Services, and the page or feature you requested. \"Cookies\" are identifiers we transfer to your browser or device that allow us to recognize your browser or device and tell us how and when pages and features in our Services are visited and by how many people. You may be able to change the preferences on your browser or device to prevent or limit your device’s acceptance of cookies, but this may prevent you from taking advantage of some or all of our features.",
        changesToApp: "Changes to Buffalo Access",
        changesToAppText: "Buffalo Access may terminate, change, suspend or discontinue any aspect of its Services, including removing, adding, modifying or otherwise changing any features and/or content at any time without notice or liability. Buffalo Access reserves the right, but shall not be obligated, to correct any errors or omissions in any portion of Buffalo Access at any time without notice to any Buffalo Access user or third party linked to the website or application.",
        changesToTerms: "Changes to Terms and Conditions",
        changesToTermsText: "Buffalo Access reserves the right to change these Terms and Conditions from time to time as it sees fit.",
      },
      es: {
        title: 'Términos y condiciones',
        termsText: "Lea lo siguiente para conocer los términos y condiciones que aplican al usar nuestro sitio web, productos, servicios y aplicación móvil con respecto al proyecto Buffalo Access (colectivamente, los \"Servicios\"). No utilice este sitio web o aplicación a menos que haya leído estos términos y acepte que estos regirán su derecho a usar y acceder a nuestros Servicios.",
        availability: "Disponibilidad",
        availabilityText: "A través de su uso de los Servicios, Buffalo Access estará disponible para usted en relación con los viajes hacia, desde, dentro y alrededor del Buffalo Niagara Medical Campus. Queda prohibida la redistribución o republicación de cualquier parte de Buffalo Access o de su contenido. Buffalo Access, en la medida en que lo permita la ley, incluido, entre otros, el Título VI de la Ley de Derechos Civiles de 1964, en su versión modificada, se reserva el derecho de denegar cualquiera o todos sus Servicios a cualquier persona. Buffalo Access se reserva el derecho de investigar y tomar medidas, incluida la eliminación de los registros de un usuario, en respuesta a acusaciones de mala conducta o actividad ilegal.",
        privacy: "Privacidad",
        privacyText: "Al usar o acceder a nuestros Servicios de cualquier manera, o al proporcionarnos Información Personal (definida a continuación), usted reconoce que acepta las prácticas y políticas descritas en estos términos y condiciones, ya que los mismos pueden ser modificados por nosotros de vez en cuando. Buffalo Access recopila varios tipos de información personal de los usuarios para utilizarla de forma intencionada en relación con la prestación de nuestros servicios para permitirle configurar su cuenta y perfil de usuario, ponernos en contacto con usted, satisfacer sus solicitudes de determinados productos y servicios, analizar cómo utiliza los servicios y proporcionarle un apoyo integral para la planificación y ejecución de viajes en función de sus preferencias y necesidades de accesibilidad. Buffalo Access recibe y almacena cualquier información que usted proporciona. Por ejemplo, a través del proceso de registro y/o a través de la configuración de su cuenta, Buffalo Access puede recopilar información personal como su nombre, dirección de correo electrónico y número de teléfono (la \"Información personal\"). Antes de que se almacenen sus datos, los datos se anonimizarán y encriptarán para mantener la seguridad y proteger su privacidad.\n\nCada vez que interactúa con nuestros Servicios, Buffalo Access recibe y registra automáticamente información en los registros de nuestro servidor desde su navegador o dispositivo, que puede incluir su dirección IP, identificación del dispositivo, información de \"cookies\", el tipo de navegador y/o dispositivo que está utilizando para acceder a nuestros Servicios y la página o función que solicitó. Las \"cookies\" son identificadores que transferimos a su navegador o dispositivo que nos permiten reconocer su navegador o dispositivo y nos dicen cómo y cuándo se visitan las páginas y funciones de nuestros Servicios y por cuántas personas. Es posible que pueda cambiar las preferencias de su navegador o dispositivo para evitar o limitar la aceptación de cookies por parte de su dispositivo, pero esto puede impedirle aprovechar algunas o todas nuestras funciones.",
        changesToApp: "Cambios en Buffalo Access",
        changesToAppText: "Buffalo Access puede cancelar, cambiar, suspender o interrumpir cualquier aspecto de sus Servicios, incluida la eliminación, adición, modificación o cambio de cualquier característica y/o contenido en cualquier momento sin previo aviso ni responsabilidad. Buffalo Access se reserva el derecho, pero no estará obligado, a corregir cualquier error u omisión en cualquier parte de Buffalo Access en cualquier momento y sin previo aviso a ningún usuario de Buffalo Access o a un tercero vinculado al sitio web o la aplicación.",
        changesToTerms: "Cambios en los Términos y Condiciones",
        changesToTermsText: "Buffalo Access se reserva el derecho de cambiar estos Términos y Condiciones según lo considere oportuno.",
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
