export const getLocation = (
  options = {
    enableHighAccuracy: true,
    timeout: 10000,
  }
) => {
  if (!navigator.geolocation) return Promise.resolve({});
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
