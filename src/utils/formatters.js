function zeroPad(n) {
  return (n < 10 ? '0' : '') + n;
}

const module = {
  phone: {
    /**
     * Formats phone number in the domestic version: 555-555-5555
     * @param {string} phone
     */
    asDomestic: phone => {
      if (phone.length <= 12) {
        const number = phone.replace(/\D/g, '');
        const formatted = number.replace(
          /(\d{1,3})?(\d{1,3})?(\d{1,4})?/,
          (_, p1, p2, p3) => {
            let output = '';
            if (p1) {
              output = `${p1}`;
            }
            if (p2) {
              output += `-${p2}`;
            }
            if (p3) {
              output += `-${p3}`;
            }
            return output;
          }
        );
        return formatted;
      }

      return phone.substring(0, 12);
    },

    /**
     * Formats phone number in the international version: +1-555-555-5555
     */
    asInternational: phone => {
      if (phone.length <= 14) {
        let number = phone.replace(/\D/g, '');
        if (number.slice(0, 1) === '1') {
          number = number.substring(1);
        }
        const formatted = number.replace(
          /(\d{1,3})?(\d{1,3})?(\d{1,4})?/,
          (_, p1, p2, p3) => {
            let output = '';
            if (p1) {
              output = `1-${p1}`;
            }
            if (p2) {
              output += `-${p2}`;
            }
            if (p3) {
              output += `-${p3}`;
            }
            return output;
          }
        );
        return formatted;
      }
      return phone.substring(0, 14);
    },
  },

  datetime: {
    /**
     * Format the trip duration as X hr(s) Y min(s) Z sec(s)
     * @param {int} tripDuration: total duration of a trip in seconds
     * @param {bool} includeSeconds: whether or not to show the seconds value
     */
    asDuration: (seconds, includeSeconds) => {
      let mins = Math.round(seconds / 60);
      const hrs = Math.floor(mins / 60);
      mins %= 60;
      return (
        (hrs ? `${hrs} hr${hrs > 1 ? 's' : ''}` : '') +
        (mins ? `${(hrs ? ' ' : '') + mins} min${mins > 1 ? 's' : ''}` : '') +
        (includeSeconds && hrs === 0 && mins === 0
          ? `${seconds} sec${seconds > 1 ? 's' : ''}`
          : '')
      );
    },

    /**
     * Format Date object as 8:00 AM
     * @param {Date} datetime: a Date object
     */
    asHHMMA: datetime => {
      const h = datetime.getHours();
      return `${h % 12 || 12}:${zeroPad(datetime.getMinutes())} ${
        h < 12 ? 'AM' : 'PM'
      }`;
    },

    /**
     * Format Date object as 8:01am; used mostly for OTP
     * @param {Date} datetime: a Date object
     */
    asHMA: datetime => {
      const h = datetime.getHours();
      return `${h % 12 || 12}:${zeroPad(datetime.getMinutes())}${
        h < 12 ? 'am' : 'pm'
      }`;
    },

    /**
     * Format Date object as 1-1-2020; used mostly for OTP
     * @param {Date} datetime: a Date object
     */
    asMDYYYY: datetime =>
      `${
        datetime.getMonth() + 1
      }-${datetime.getDate()}-${datetime.getFullYear()}`,
  },

  distance: {
    /**
     * Format the total trip plan distance in miles
     * @param {[]object} tripLegs: array of TripPlan legs
     */
    asTotalMiles: tripLegs => {
      const m = tripLegs.reduce((total, leg) => total + leg.distance, 0);
      return module.distance.asMiles(m);
    },

    /**
     * Format meters to miles
     * @param {number} meters
     */
    asMiles: meters => {
      const mi = (meters * 3.28084) / 5280;
      return `${Math.round(mi * 10) / 10} mi`;
    },

    /**
     * Format meters to feet
     * @param {number} meters
     */
    asFeet: meters => {
      const ft = meters * 3.28084;
      return `${Math.round(ft)} ft`;
    },
  },
};

export default module;