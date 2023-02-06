import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { Loader } from '../Loader/Loader';
import config from '../../config';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useMapStore } from '../../context/MapStore';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

const sampleLayer = {
  type: 'FeatureCollection',
  features: [],
};
sampleLayer.features.push({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-78.86, 42.8],
  },
  properties: {},
});

const layers = [
  {
    id: 'sample',
    type: 'circle',
    source: 'sample',
    paint: {
      'circle-radius': 12,
      'circle-color': 'cyan',
      'circle-stroke-color': 'white',
      'circle-stroke-width': 4,
    },
  },
];

export const MapboxMap = ({ showMap }) => {
  const { mapStyle: mode } = useMapStore();

  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-78.863241);
  const [lat, setLat] = useState(42.882341);
  const [zoom, setZoom] = useState(9.5);
  const [mapIsLoaded, setMapIsLoaded] = useState(mapRef.current ? true : false);

  window.addEventListener('resize', () => {
    if (mapRef.current) mapRef.current.resize();
  });

  useEffect(() => {
    if (mapRef.current && showMap) {
      console.log('resizing map');
      mapRef.current.resize();
    }
    if (mapRef.current && mapIsLoaded) {
      const style = mapRef.current.getStyle();
      console.log(style);
      mapRef.current.resize();
      if (mode === 'DAY' && style.name === 'Rural Mobility Navigation Day')
        return;
      if (mode === 'NIGHT' && style.name === 'Rural Mobility Navigation Night')
        return;
      initLayers(mapRef.current);
      mapRef.current.setStyle(config.MAP.BASEMAPS[mode]);
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: config.MAP.BASEMAPS[mode],
        center: [lng, lat],
        zoom: zoom,
      })
        .on('load', initMap)
        .on('style.load', initLayers);
    }

    function initMap() {
      setMapIsLoaded(true);
      const map = this;
      map.on('moveend', () => {
        const { lat, lng } = map.getCenter();
        setLng(lng);
        setLat(lat);
        setZoom(() => map.getZoom());
      });
      map.on('zoomend', () => {
        const { lat, lng } = map.getCenter();
        setLng(lng);
        setLat(lat);
        setZoom(() => map.getZoom());
      });
    }

    function initLayers(e) {
      const map = e.target ? e.target : e;

      console.log('[map] checking sources');

      if (!map.getSource('sample')) {
        console.log('[map] adding sources');
        map.addSource('sample', {
          type: 'geojson',
          data: sampleLayer,
        });
      }

      console.log('[map] checking layers');
      layers.forEach(l => {
        if (!map.getLayer(l.id)) {
          console.log('[map] adding layer', l.id);
          map.addLayer(l);
        }
      });
    }

    //eslint-disable-next-line
  }, [mode]);

  // useEffect(() => {
  //   mapContainer.current = document.createElement('div');
  //   document.body.appendChild(mapContainer.current);
  //   return () => {
  //     document.body.removeChild(mapContainer.current);
  //   };
  // }, []);

  return (
    <Box flex={1} display={showMap ? 'block' : 'none'}>
      <Loader isOpen={!mapIsLoaded}></Loader>
      <div ref={mapContainer} className="mapbox" style={{ height: '100%' }} />
    </Box>
  );
};
