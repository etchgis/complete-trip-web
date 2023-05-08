export const mapListeners = (map, setCenter, setMapIsLoaded) => {
  setMapIsLoaded(true);
  // map.on('moveend', () => {
  //   const { lat, lng } = map.getCenter();
  //   setCenter({
  //     center: [lng, lat],
  //     zoom: map.getZoom(),
  //   });
  // });
  // map.on('zoomend', () => {
  //   const { lat, lng } = map.getCenter();
  //   setCenter({
  //     center: [lng, lat],  
  //     zoom: map.getZoom(),
  //   });
  // });

  // map.on('click', e => {
  //   console.log(map.queryRenderedFeatures(e.point));
  //   console.log(map.getStyle().layers);
  // });
};

/*

Load all stops when app/site opens.
Load all the stops in this super fast lib written by our old pal Vlad: https://github.com/mourner/geokdbush
Get center of map extent and call geokdbush.around for nearest N stops.
Query routes by each stop with mobility.stops.routes() and keep only unique ones from the N stops above.
When user clicks on route get stops with mobility.routes.stops(), patterns with mobility.routes.patterns(), and then geometry with mobility.patterns.geometry()
I'm going to update the package for routes so with a new method mobility.routes.detail() will return all the geometry and stops associated with it.  That should be less than 10 calls at most.  That will replace step 4 above.

this._doDelayedSearch = debounce(this.doSearch, 500);
doSearch = (value) => {
    ...search code here
}
map.onPan(doSearch)

*/
