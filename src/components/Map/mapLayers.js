import lines from './mapdata/lines.geojson';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import points from './mapdata/stops.geojson';

export const mapLayers = e => {
  const map = e.target ? e.target : e;
  console.log('[map] checking sources');
  if (!map.getSource('points')) {
    map.addSource('points', {
      type: 'geojson',
      data: points,
    });
  }
  if (!map.getSource('lines')) {
    map.addSource('lines', {
      type: 'geojson',
      data: lines,
    });
  }

  const layers = [
    {
      id: 'lines-outline',
      type: 'line',
      source: 'lines',
      paint: {
        'line-color': '#1A202C',
        'line-width': 6,
        'line-opacity': 1,
      },
    },

    {
      id: 'lines',
      type: 'line',
      source: 'lines',
      paint: {
        'line-color': 'snow',
        'line-width': 4,
        'line-opacity': 1,
      },
    },

    {
      id: 'lines-highlight',
      type: 'line',
      source: 'lines',
      paint: {
        'line-color': '#c21858',
        'line-width': 8,
        'line-opacity': 1,
      },
      filter: ['==', ['get', 'rt_shrt_nm'], ''],
    },

    {
      id: 'points',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': 5,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(255,255,255,1)',
        'circle-blur': 0,
        'circle-color': '#1A202C',
        'circle-opacity': 1,
      },
      minzoom: 13,
    },
    {
      id: 'points-highlight',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': 6,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#e91e63',
        'circle-blur': 0,
        'circle-color': '#1A202C',
        'circle-opacity': 1,
      },
      filter: ['==', ['get', 'stop_code'], ''],
    },
  ];

  console.log('[map] checking layers');
  layers.forEach(l => {
    if (!map.getLayer(l.id)) {
      console.log('[map] adding layer', l.id);
      map.addLayer(l, 'road-label-navigation');
    }
  });
  layerInteractions(map);
};

function layerInteractions(map) {
  return;
  map.on('click', function (e) {
    map.setFilter('lines-highlight', ['==', ['get', 'rt_shrt_nm'], '']);
    map.setFilter('points-highlight', ['==', ['get', 'stop_code'], '']);
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['lines', 'points', 'lines-outline'],
    });
    let description = '';

    if (features.length === 0) {
      return;
    }

    const props = features[0].properties;
    console.log(props);
    // console.log(features);

    if (props.shape_ids) {
      const lineFilter = ['any'];
      const shapeIdsArray = props.shape_ids.split(',');
      for (let i = 0; i < shapeIdsArray.length; i++) {
        lineFilter.push(['==', ['get', 'shape_id'], shapeIdsArray[i]]);
      }
      console.log(lineFilter);
      map.setFilter('lines-highlight', lineFilter);
      map.setFilter('points-highlight', [
        '==',
        ['get', 'stop_code'],
        props.stop_code,
      ]);
    }

    if (props.shape_id) {
      map.setFilter('lines-highlight', [
        '==',
        ['get', 'shape_id'],
        props.shape_id,
      ]);
      map.setFilter('points-highlight', [
        'in',
        props.shape_id,
        ['get', 'shape_ids'],
      ]);
    }

    for (let k in features[0].properties) {
      description += `${k}: ${props[k]} <br>`;
    }

    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'lines', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'lines', function () {
    map.getCanvas().style.cursor = '';
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'points', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'points', function () {
    map.getCanvas().style.cursor = '';
  });
}
