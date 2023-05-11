import { featureCollection } from '@turf/helpers';
import { theme } from '../../theme';

// import lines from './mapdata/lines.json';
// import points from './mapdata/stops.json';

// import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

export const mapLayers = e => {
  const map = e.target ? e.target : e;
  // console.log('[map] checking sources');
  if (!map.getSource('stops')) {
    map.addSource('stops', {
      type: 'geojson',
      data: featureCollection([]),
    });
  }
  // if (!map.getSource('points')) {
  //   map.addSource('points', {
  //     type: 'geojson',
  //     data: points,
  //   });
  // }
  // if (!map.getSource('lines')) {
  //   map.addSource('lines', {
  //     type: 'geojson',
  //     data: lines,
  //   });
  // }
  if (!map.getSource('routes-highlight')) {
    map.addSource('routes-highlight', {
      type: 'geojson',
      data: featureCollection([]),
    });
  }

  const layers = [
    // {
    //   id: 'lines-outline',
    //   type: 'line',
    //   source: 'lines',
    //   paint: {
    //     'line-color': 'white',
    //     'line-width': 8,
    //     'line-opacity': 0.6,
    //   },
    // },

    // {
    //   id: 'lines',
    //   type: 'line',
    //   source: 'lines',
    //   paint: {
    //     'line-color': 'red',
    //     'line-width': 4,
    //     'line-opacity': 0.6,
    //   },
    // },
    // {
    //   id: 'points',
    //   type: 'circle',
    //   source: 'points',
    //   paint: {
    //     'circle-radius': 3,
    //     'circle-stroke-width': 1,
    //     'circle-stroke-color': 'rgba(255,255,255,1)',
    //     'circle-blur': 0.1,
    //     'circle-color': 'lightgray',
    //     'circle-opacity': 0.8,
    //   },
    //   minzoom: 10,
    // },
    {
      id: 'routes-outline',
      type: 'line',
      source: 'routes-highlight',
      paint: {
        'line-color': [
          'case',
          ['has', 'outlineColor'],
          ['get', 'outlineColor'],
          '#fff',
        ],
        'line-width': 10,
        'line-opacity': 1,
      },
    },
    {
      id: 'routes-highlight',
      type: 'line',
      source: 'routes-highlight',
      paint: {
        'line-color': [
          'case',
          ['has', 'routeColor'],
          ['get', 'routeColor'],
          '#121212',
        ],
        'line-width': 6,
        'line-opacity': 1,
      },
    },

    // {
    //   id: 'lines-highlight',
    //   type: 'line',
    //   source: 'lines',
    //   paint: {
    //     'line-color': '#c21858',
    //     'line-width': 8,
    //     'line-opacity': 1,
    //   },
    //   filter: ['==', ['get', 'rt_shrt_nm'], ''],
    // },
    {
      id: 'stops',
      type: 'circle',
      source: 'stops',
      paint: {
        'circle-radius': 5,
        'circle-stroke-width': 3.5,
        'circle-stroke-color': [
          'case',
          ['has', 'routeColor'],
          ['get', 'routeColor'],
          '#121212',
        ],
        'circle-blur': 0,
        'circle-color': [
          'case',
          ['has', 'outlineColor'],
          ['get', 'outlineColor'],
          '#fff',
        ],
        'circle-opacity': 1,
      },
      minzoom: 10,
    },
  ];

  // console.log('[map] checking layers');
  layers.forEach(l => {
    if (!map.getLayer(l.id)) {
      console.log('[map] adding layer', l.id);
      const beforeLayer = l.id === 'stops' ? '' : 'road-label-navigation';
      map.addLayer(l, beforeLayer);
    }
  });
  // layerInteractions(map);
};

// function layerInteractions(map) {
//   // return;
//   map.on('click', function (e) {
//     console.log(map.queryRenderedFeatures(e.point));
//     map.setFilter('lines-highlight', ['==', ['get', 'rt_shrt_nm'], '']);
//     map.setFilter('points-highlight', ['==', ['get', 'stop_code'], '']);
//     const features = map.queryRenderedFeatures(e.point, {
//       layers: ['lines', 'points', 'lines-outline'],
//     });
//     let description = '';

//     if (features.length === 0) {
//       return;
//     }

//     const props = features[0].properties;
//     console.log(props);
//     // console.log(features);

//     if (props.shape_ids) {
//       const lineFilter = ['any'];
//       const shapeIdsArray = props.shape_ids.split(',');
//       for (let i = 0; i < shapeIdsArray.length; i++) {
//         lineFilter.push(['==', ['get', 'shape_id'], shapeIdsArray[i]]);
//       }
//       console.log(lineFilter);
//       map.setFilter('lines-highlight', lineFilter);
//       map.setFilter('points-highlight', [
//         '==',
//         ['get', 'stop_code'],
//         props.stop_code,
//       ]);
//     }

//     if (props.shape_id) {
//       map.setFilter('lines-highlight', [
//         '==',
//         ['get', 'shape_id'],
//         props.shape_id,
//       ]);
//       map.setFilter('points-highlight', [
//         'in',
//         props.shape_id,
//         ['get', 'shape_ids'],
//       ]);
//     }

//     for (let k in features[0].properties) {
//       description += `${k}: ${props[k]} <br>`;
//     }

//     new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map);
//   });

//   // Change the cursor to a pointer when the mouse is over the places layer.
//   map.on('mouseenter', 'lines', function () {
//     map.getCanvas().style.cursor = 'pointer';
//   });

//   // Change it back to a pointer when it leaves.
//   map.on('mouseleave', 'lines', function () {
//     map.getCanvas().style.cursor = '';
//   });

//   // Change the cursor to a pointer when the mouse is over the places layer.
//   map.on('mouseenter', 'points', function () {
//     map.getCanvas().style.cursor = 'pointer';
//   });

//   // Change it back to a pointer when it leaves.
//   map.on('mouseleave', 'points', function () {
//     map.getCanvas().style.cursor = '';
//   });
// }
