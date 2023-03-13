export const fillGaps = legs => {
  for (let i = 0; i < legs.length; i++) {
    legs[i].legIndex = i;
  }
  var copy = legs.slice(0);
  for (let i = legs.length - 1; i >= 0; i--) {
    var leg = legs[i],
      prevLeg = legs[i - 1];
    if (!prevLeg) {
      break;
    }
    var start = new Date(leg.startTime),
      end = new Date(prevLeg.endTime);
    if (
      prevLeg.endTime !== leg.startTime &&
      start.getMinutes() !== end.getMinutes()
    ) {
      var gap = {
        startTime: prevLeg.endTime,
        endTime: leg.startTime,
        routeColor: '#CCCCCC',
        mode: 'WAIT',
        distance: 0,
        duration: (start.getTime() - end.getTime()) / 1000,
        legIndex: -1,
      };
      copy.splice(i, 0, gap);
    }
  }
  return copy;
};
