const icon =
  '<svg version="1.1" width="24" height="24" viewBox="0 0 16 16" class="octicon octicon-screen-full" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor"><path fill-rule="evenodd" d="M2.75 2.5a.25.25 0 00-.25.25v2.5a.75.75 0 01-1.5 0v-2.5C1 1.784 1.784 1 2.75 1h2.5a.75.75 0 010 1.5h-2.5zM10 1.75a.75.75 0 01.75-.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a.75.75 0 01-1.5 0v-2.5a.25.25 0 00-.25-.25h-2.5a.75.75 0 01-.75-.75zM1.75 10a.75.75 0 01.75.75v2.5c0 .138.112.25.25.25h2.5a.75.75 0 010 1.5h-2.5A1.75 1.75 0 011 13.25v-2.5a.75.75 0 01.75-.75zm12.5 0a.75.75 0 01.75.75v2.5A1.75 1.75 0 0113.25 15h-2.5a.75.75 0 010-1.5h2.5a.25.25 0 00.25-.25v-2.5a.75.75 0 01.75-.75z"/></svg>';

export class MapboxGLFullPage {
  constructor() {
    this.onAdd = function (map) {
      this._map = map;

      const style = {
        width: '100vw',
        position: 'absolute',
        top: '0px',
        left: '0px',
        bottom: '0px',
        height: '100vh',
        maxHeight: '100vh',
        zIndex: 100,
      };

      const originalStyle = {
        width: 'auto',
        position: 'relative',
        top: 'unset',
        left: 'unset',
        bottom: 'unset',
        height: 'auto',
        maxHeight: 'unset',
        zIndex: 1,
      };

      this._active = false;

      this._btn = document.createElement('button');
      this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-custom-ctrl';
      this._btn.type = 'button';
      this._btn['aria-label'] = 'Full Screen';
      this._btn.dataset.tooltip = 'Full Screen';
      this._btn.innerHTML = icon;
      this._btn.style.display = 'flex';
      this._btn.style.alignItems = 'center';
      this._btn.style.justifyContent = 'center';
      this._btn.onclick = () => {
        // console.log(this._map)
        // console.log(originalStyle);
        // console.log(this._active)
        if (this._active) {
          Object.keys(originalStyle).forEach(key => {
            this._map._container.style[key] = originalStyle[key];
          });
        } else {
          this._map._container.scrollIntoView();
          setTimeout(() => {
            originalStyle.width = this._map._container.style.width;
            originalStyle.height = this._map._container.style.height;
            const elementRect = this._map._container.getBoundingClientRect();
            const offsetTop = elementRect.top + window.scrollY;
            const elementLeft = elementRect.left + window.scrollX;
            style.top = `-${offsetTop}px`;
            style.left = `-${elementLeft}px`;

            Object.keys(style).forEach(key => {
              this._map._container.style[key] = style[key];
            });
          }, 50);
        }
        setTimeout(() => this._map.resize(), 50);
        this._active = !this._active;
      };

      this._container = document.createElement('div');
      this._container.className =
        'mapboxgl-ctrl mapboxgl-ctrl-group box-shadow';
      this._container.appendChild(this._btn);

      document.onkeydown = evt => {
        evt = evt || window.event;
        let isEscape = false;
        if ('key' in evt) {
          isEscape = evt.key === 'Escape' || evt.key === 'Esc';
        }
        if (isEscape && this._active) {
          Object.keys(originalStyle).forEach(key => {
            this._map._container.style[key] = originalStyle[key];
          });
          document.body.style.overflow = 'auto';
          this._active = false;
        }
      };

      return this._container;
    };

    this.onRemove = function () {
      this._container.parentNode.removeChild(this._btn);
      this._map = undefined;
    };
  }
}
