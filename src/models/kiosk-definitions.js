/**
 * Kiosk definitions for Complete Trip application
 * Each kiosk entry contains configuration settings that can be overridden by URL parameters
 */

const kioskDefinitions = {
  // Buffalo General Medical Center Lobby
  bgmclobby: {
    displayName: "Buffalo General Medical Center Lobby",
    description: "Main lobby kiosk at Buffalo General Medical Center",
    location: {
      lng: -78.8664400,
      lat: 42.9005780
    },
    pickupPoint: {
      lng: -78.866774,
      lat: 42.900396
    },
    pickupDescription: "NFTA paratransit stop at the High Street entrance",
    pickupAddress: "100 High St, Buffalo, NY 14203",
    kioskDirections: {
      en: "Exit the building and look for the NFTA paratransit stop located at the light pole to the right of the building exit on High Street.",
      es: "Salga del edificio y busque la parada de paratránsito de NFTA ubicada en el poste de luz a la derecha de la salida del edificio en High Street."
    },
    pickupImagePath: "/stops/bgmc-pickup.jpg",
    // defaultDestinations: [
    //   {
    //     name: "Oishei Children's Hospital",
    //     location: { lng: -78.8683900, lat: 42.8998600 }
    //   },
    //   {
    //     name: "Roswell Park Cancer Institute",
    //     location: { lng: -78.8650800, lat: 42.8997500 }
    //   }
    // ],
    showShuttle: true,
    showPublicTransit: true
  },

  // NFTA Summer-Best Light Rail Station
  summerbest: {
    displayName: "NFTA Summer-Best Station",
    description: "Light rail station kiosk at Summer-Best",
    location: {
      lng: -78.867528,
      lat: 42.904736
    },
    pickupPoint: {
      lng: -78.867576,
      lat: 42.904554
    },
    pickupDescription: "Summer-Best Station main entrance",
    pickupAddress: "22 Best St, Buffalo, NY 14209",
    kioskDirections: {
      en: "The shuttle will arrive directly outside the front doors of the Summer-Best Station on Best Street. Wait near the station entrance.",
      es: "El transporte llegará directamente afuera de las puertas principales de la estación Summer-Best en Best Street. Espere cerca de la entrada de la estación."
    },
    pickupImagePath: "/stops/summer-best-station-pickup.jpg",
    // defaultDestinations: [
    //   {
    //     name: "Buffalo General Medical Center",
    //     location: { lng: -78.8664400, lat: 42.9005780 }
    //   },
    //   {
    //     name: "Buffalo Niagara Medical Campus",
    //     location: { lng: -78.8680000, lat: 42.9000000 }
    //   }
    // ],
    showShuttle: true,
    showPublicTransit: true
  }
};

/**
 * Gets current kiosk configuration by parsing URL parameters
 * URL params override defaults defined in kioskDefinitions
 * @returns {Object|null} The kiosk configuration or null if not in kiosk mode
 */
export const getCurrentKioskConfig = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const mode = queryParams.get('mode');

  // Only provide kiosk config if in kiosk mode
  if (mode !== 'kiosk') {
    return null;
  }

  // TEMP: until the summerbest kiosk is configured, default to summerbest
  const kioskId = queryParams.get('kiosk') ?? 'summerbest';
  const urlLocation = queryParams.get('location');
  const urlPickup = queryParams.get('pickup');
  const urlDisplayName = queryParams.get('displayName');
  const urlDescription = queryParams.get('description');
  const urlPickupDescription = queryParams.get('pickupDescription');
  const urlPickupAddress = queryParams.get('pickupAddress');
  const urlShowShuttle = queryParams.get('showShuttle');
  const urlShowPublicTransit = queryParams.get('showPublicTransit');

  // Get the base kiosk configuration or use a default empty config
  const baseConfig = (kioskId && kioskDefinitions[kioskId]) ? kioskDefinitions[kioskId] : {
    displayName: kioskId ? `${kioskId} Kiosk` : "Unknown Kiosk",
    description: "Kiosk",
    location: { lng: 0, lat: 0 },
    pickupPoint: { lng: 0, lat: 0 },
    pickupDescription: "",
    pickupAddress: "",
    showShuttle: true,
    showPublicTransit: true
  };

  const config = { ...baseConfig };

  // Override location if provided in URL
  if (urlLocation) {
    try {
      const coordinates = urlLocation.split(',');
      if (coordinates.length === 2) {
        config.location = {
          lng: parseFloat(coordinates[0]),
          lat: parseFloat(coordinates[1])
        };
      }
    } catch (error) {
      console.error('Invalid location format in URL parameters', error);
    }
  }

  // Override pickup point if provided
  if (urlPickup) {
    try {
      const coordinates = urlPickup.split(',');
      if (coordinates.length === 2) {
        config.pickupPoint = {
          lng: parseFloat(coordinates[0]),
          lat: parseFloat(coordinates[1])
        };
      }
    } catch (error) {
      console.error('Invalid pickup format in URL parameters', error);
    }
  }

  // Override other properties if provided
  if (urlDisplayName) config.displayName = urlDisplayName;
  if (urlDescription) config.description = urlDescription;
  if (urlPickupDescription) config.pickupDescription = urlPickupDescription;
  if (urlPickupAddress) config.pickupAddress = urlPickupAddress;
  if (urlShowShuttle !== null) {
    config.showShuttle = urlShowShuttle === 'true';
  }
  if (urlShowPublicTransit !== null) {
    config.showPublicTransit = urlShowPublicTransit === 'true';
  }

  return config;
};

/**
 * Creates a trip origin point from the current kiosk configuration
 * @returns {Object|null} The trip origin object or null if not in kiosk mode
 */
export const getKioskOrigin = () => {
  const kioskConfig = getCurrentKioskConfig();

  if (!kioskConfig) {
    return null;
  }

  return {
    description: "",
    distance: 0,
    point: {
      lat: kioskConfig.location.lat,
      lng: kioskConfig.location.lng
    },
    text: kioskConfig.displayName || "Kiosk",
    title: kioskConfig.displayName || "Kiosk"
  };
};

export default kioskDefinitions;
