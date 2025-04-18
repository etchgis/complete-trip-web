# Complete Trip Web

A web application for trip planning and navigation using public transit and on-demand shuttles.

## Cypress Tests

Tests are located in the following folders:

- `./cypress/e2e/api`
- `./cypress/e2e/translations`
- `./src/__tests__`

## UI modes

The application supports different UI modes that can be set via URL parameters:

- `?mode=callcenter` - For call center operators
- `?mode=kiosk` - For public kiosks installed at fixed locations

### Kiosk Mode

Kiosk mode is designed for fixed installations at specific locations like hospitals, transit centers, etc. 

Example kiosk URLs:
```
https://completetrip.etch.app/map?mode=kiosk&kiosk=bgmclobby&location=-78.8664400,42.9005780
https://completetrip.etch.app/map?mode=kiosk&kiosk=summerbest
```

#### Kiosk Parameters

- `mode=kiosk` - Activates kiosk mode
- `kiosk=[id]` - The kiosk identifier that maps to a predefined configuration
- `location=lng,lat` - Override the default kiosk location coordinates
- `pickup=lng,lat` - Override the default pickup point coordinates
- `showShuttle=true|false` - Control whether to show shuttle options
- `showPublicTransit=true|false` - Control whether to show public transit options

#### Kiosk Definitions

Kiosk definitions are stored in `src/models/kiosk-definitions.js`. Each kiosk entry contains configuration for:

- `displayName` - The name shown to users
- `description` - Description of the kiosk location
- `location` - The geographic coordinates of the kiosk
- `pickupPoint` - The nearby pickup point for shuttle/transit
- `pickupDescription` - Description of the pickup point
- `defaultDestinations` - Common destinations from this kiosk
- `showShuttle` - Whether to show shuttle options
- `showPublicTransit` - Whether to show public transit options

To add a new kiosk definition, edit the `kioskDefinitions` object in the file.
