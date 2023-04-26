export const mapListeners = (map, setCenter, setMapIsLoaded) => {
  setMapIsLoaded(true);
  map.on('moveend', () => {
    const { lat, lng } = map.getCenter();
    setCenter({
      center: [lng, lat],
      zoom: map.getZoom(),
    });
  });
  map.on('zoomend', () => {
    const { lat, lng } = map.getCenter();
    setCenter({
      center: [lng, lat],
      zoom: map.getZoom(),
    });
  });

  // map.on('click', e => {
  //   console.log(map.queryRenderedFeatures(e.point));
  //   console.log(map.getStyle().layers);
  // });
};
