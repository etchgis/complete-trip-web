class MapManager {

  constructor(map, name) {
    this.map = map;
    this.name = name;
    this.layers = [];
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

      duration,
    );
  }

}

export default MapManager;
