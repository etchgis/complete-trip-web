export default class TripRequest {
  origin = {
    point: {
      lat: 0,
      lng: 0,
    },
  };
  destination = {
    point: {
      lat: 0,
      lng: 0,
    },
  }
  whenAction = 'asap';
  whenTime = new Date();
  requirements = [];
  modes = [];
  bannedAgencies = [];
  bannedProviders = [];
  sortBy = 'fastest';
  caretaker = '';
  id = null;

  constructor(options) {
    Object.assign(this, options);
  }

  /**
   * See if the item is in the requirements list.
   * @param {string} name
   * @returns {boolean}
   */
  hasRequirement(name) {
    return this.requirements.indexOf(name) !== -1;
  }

  /**
   * Add the given requirement to the list, if it doesn't already exist.
   * @param {string} name
   */
  addRequirement(name) {
    if (!this.hasRequirement(name)) {
      this.requirements.push(name);
      this.requirements = this.requirements.sort();
    }
  }

  /**
   * Remove the given requirement from the list, if it exists.
   * @param {string} name
   */
  removeRequirement(name) {
    const index = this.requirements.indexOf(name);
    if (index !== -1) {
      this.requirements.splice(index, 1);
    }
  }

  /**
   * Add the given requirement to the list, or remove it.
   * @param {string} name
   */
  toggleRequirement(name) {
    if (this.hasRequirement(name)) {
      this.removeRequirement(name);
    }
    else {
      this.addRequirement(name);
    }
  }

  /**
   * See if the item is in the modes list.
   * @param {string} name
   * @returns {boolean}
   */
  hasMode(name) {
    return this.modes.indexOf(name) !== -1;
  }

  /**
   * Add the given option to the list, if it doesn't already exist.
   * @param {string} name
   */
  addMode(name) {
    if (this.modes.indexOf(name) === -1) {
      this.modes.push(name);
      this.modes = this.modes.sort();
    }
  }

  /**
   * Remove the given mode from the list, if it exists.
   * @param {string} name
   */
  removeMode(name) {
    const index = this.modes.indexOf(name);
    if (index !== -1) {
      this.modes.splice(index, 1);
    }
  }

  /**
   * Add the given mode to the list, or remove it.
   * @param {string} name
   */
  toggleMode(name) {
    if (this.hasMode(name)) {
      this.removeMode(name);
    }
    else {
      this.addMode(name);
    }
  }

  /**
   * Update a given property
   * @param {string} property
   * @param {any} value
   */
  updateProperty(property, value) {
    if (property in this) {
      this[property] = value;
    }
  }

  /**
   * Update a givern preference
   * @param {string} preference
   * @param {any} value
   */
  updatePreference(preference, value) {
    if (preference in this.preferences) {
      this.preferences[preference] = value;
    }
  }
}
