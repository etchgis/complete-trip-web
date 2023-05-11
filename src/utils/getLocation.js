export const getLocation = (
  options = {
    enableHighAccuracy: true,
    timeout: 10000,
  }
) => {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ center: [longitude, latitude], precision: accuracy });
      },
      error => {
        console.log(error);
        resolve({});
      },
      options
    );
  });
};
