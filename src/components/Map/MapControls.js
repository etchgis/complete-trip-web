import mapboxgl from 'mapbox-gl';

export const mapControls = {
  locate: new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: false,
  }),
  nav: new mapboxgl.NavigationControl(),
};
