import { MapboxGLFullPage } from './MapboxFullPageControl';
import mapboxgl from 'mapbox-gl';

class MapboxControl {
  constructor({ className = '', title = '', eventHandler = evtHndlr, img }) {
    this._className = className;
    this._title = title;
    this._img = img;
    this._map = null;
    this._eventHandler = e => {
      eventHandler(this._map, e);
    };
  }

  onAdd(map) {
    this._map = map;
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon' + ' ' + this._className;
    this._btn.type = 'button';
    this._btn.title = this._title;
    if (this._img) {
      this._btn.style.backgroundImage = `url(${this._img})`;
      this._btn.style.backgroundRepeat = 'no-repeat';
      this._btn.style.backgroundPosition = 'center';
    }
    this._btn.onclick = this._eventHandler;

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export const mapControls = {
  bookmarks: new MapboxControl({
    className: 'mapboxgl-ctrl-bookmark',
    title: 'Bookmark',
    img: 'https://icongr.am/fontawesome/bookmark-o.svg?size=26&color=currentColor',
    eventHandler: (map, event) => {
      // const overlay = document.createElement('div');
      // overlay.innerHTML = `
      //   <div class="modal">
      //   <select>
      //   <options>Bookmark 1</options>
      //   <options>Bookmark 2</options>
      //   <options>Bookmark 3</options>
      //   </select>
      // </div>
      // `;
      // document.body.appendChild(overlay);
      const bookmarks = localStorage.getItem('bookmarks')
        ? JSON.parse(localStorage.getItem('bookmarks'))
        : [];
      if (!bookmarks.length) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bookmark = {
          center,
          zoom,
        };
        localStorage.setItem('bookmarks', JSON.stringify([bookmark]));
      } else {
        map.flyTo({
          center: bookmarks[0].center,
          zoom: bookmarks[0].zoom,
        });
      }
    },
  }),
  locate: new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserHeading: false,
  }),
  nav: new mapboxgl.NavigationControl(),
  fullscreen: new MapboxGLFullPage(),
  fullscreen2: new mapboxgl.FullscreenControl(),
};
