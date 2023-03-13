import { makeAutoObservable, runInAction } from 'mobx';

class MapManager {
  map = null;
  visible = false;
  rootStore = null;

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  setMap(mapRef) {
    this.map = mapRef;
  }

  show() {
    runInAction(() => {
      this.visible = true;
    });
  }

  hide() {
    runInAction(() => {
      this.visible = false;
    });
  }

  updateStyle(styleURI) {
    console.log(styleURI);
    this.map.updateStyle(styleURI);
  }

  fitBounds(
    northEastLatLng,
    southWestLatLng,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    duration = 0.0,
  ) {
    this.map.fitBounds(
      northEastLatLng,
      southWestLatLng,
      paddingLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      duration
    );
  }

  updateBounds(xmin, ymin, xmax, ymax) {
    this.map.fitBounds([xmax, ymax], [xmin, ymin], 0, 0, 0, 20, 0);
  }

  setExtentPaddings(top = 80, right = 20, bottom = 350, left = 20) {
    this.map.setContentInset([top, right, bottom, left]);
  }
}

export default MapManager;
