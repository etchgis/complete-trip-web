import TripRequest from './trip-request';
import formatters from '../utils/formatters';
import { otp } from '../services/transport';

const TRIP_QUERY = `
query plan(
  $from: InputCoordinates!,
  $to: InputCoordinates!,
  $date: String,
  $time: String,
  $arriveBy: Boolean,
  $wheelchair: Boolean,
  $numItineraries: Int,
  $transportModes: [TransportMode],
  $walkReluctance: Float,
  $waitReluctance: Float,
  $transferPenalty: Int,
  $walkSpeed: Float,
  $bikeSpeed: Float,
  $maxWalkDistance: Float,
  $allowedVehicleRentalNetworks: [String],
  $bannedVehicleRentalNetworks: [String],
  $allowKeepingRentedBicycleAtDestination: Boolean
) {
  plan(
    from: $from
    to: $to
    date: $date
    time: $time
    arriveBy: $arriveBy
    wheelchair: $wheelchair
    numItineraries: $numItineraries
    transportModes: $transportModes
    walkReluctance: $walkReluctance
    waitReluctance: $waitReluctance
    transferPenalty: $transferPenalty
    walkSpeed: $walkSpeed
    bikeSpeed: $bikeSpeed
    maxWalkDistance: $maxWalkDistance
    allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
    bannedVehicleRentalNetworks: $bannedVehicleRentalNetworks
    allowKeepingRentedBicycleAtDestination: $allowKeepingRentedBicycleAtDestination
  ) {
    itineraries {
      start
      end
      duration
      walkTime
      waitingTime
      walkDistance
      generalizedCost
      numberOfTransfers
      legs {
        start {
          scheduledTime
          estimated {
            time
          }
        }
        end {
          scheduledTime
          estimated {
            time
          }
        }
        mode
        duration
        realTime
        distance
        transitLeg
        from {
          name
          lat
          lon
          stop {
            gtfsId
            name
            code
          }
          vehicleRentalStation {
            stationId
            name
            rentalNetwork {
              networkId
            }
          }
        }
        to {
          name
          lat
          lon
          stop {
            gtfsId
            name
            code
          }
          vehicleRentalStation {
            stationId
            name
            rentalNetwork {
              networkId
            }
          }
        }
        route {
          gtfsId
          shortName
          longName
          type
          color
          textColor
          agency {
            gtfsId
            name
          }
        }
        trip {
          gtfsId
          tripHeadsign
        }
        intermediateStops {
          name
          gtfsId
          lat
          lon
        }
        legGeometry {
          points
        }
        steps {
          distance
          relativeDirection
          streetName
          absoluteDirection
          stayOn
          area
          bogusName
          lon
          lat
          walkingBike
        }
        rentedBike
      }
    }
    routingErrors {
      code
      description
    }
  }
}`;

export default class TripPlan {
  /**
   * Perform trip planning.
   * @param {TripRequest} tripRequest
   * @param {Object} preferences
   * @param {int} queryId
   * @returns {object[]}
   */
  static generate(tripRequest, preferences, queryId) {
    return new Promise((resolve, reject) => {
      queryPlanner(tripRequest, preferences, queryId, resolve, reject);
    });
  }
}

/**
 * Convert TransportMode array format for GraphQL
 * @param {string[]} modes
 * @returns {object[]}
 */
const convertModesToTransportModes = (modes) => {
  const transportModes = [];

  modes.forEach(mode => {
    switch(mode) {
      case 'WALK':
        transportModes.push({ mode: 'WALK' });
        break;
      case 'BICYCLE':
        transportModes.push({ mode: 'BICYCLE' });
        break;
      case 'BICYCLE_PARK':
        transportModes.push({ mode: 'BICYCLE', qualifier: 'PARK' });
        break;
      case 'MICROMOBILITY_RENT':
        transportModes.push({ mode: 'SCOOTER', qualifier: 'RENT' });
        transportModes.push({ mode: 'BICYCLE', qualifier: 'RENT' });
        break;
      case 'CAR':
        transportModes.push({ mode: 'CAR' });
        break;
      case 'CAR_PARK':
        transportModes.push({ mode: 'CAR', qualifier: 'PARK' });
        break;
      case 'CAR_HAIL':
        transportModes.push({ mode: 'CAR', qualifier: 'HAIL' });
        break;
      case 'TRANSIT':
        transportModes.push({ mode: 'BUS' });
        transportModes.push({ mode: 'TRAM' });
        transportModes.push({ mode: 'RAIL' });
        transportModes.push({ mode: 'SUBWAY' });
        transportModes.push({ mode: 'FERRY' });
        break;
      case 'FLEXIBLE':
        transportModes.push({ mode: 'FLEX', qualifier: 'DIRECT' });
        transportModes.push({ mode: 'FLEX', qualifier: 'ACCESS' });
        transportModes.push({ mode: 'FLEX', qualifier: 'EGRESS' });
        break;
      case 'UBSHUTTLE':
        transportModes.push({ mode: 'FLEX', qualifier: 'DIRECT' });
        break;
    }
  });

  return transportModes;
};

/**
 * Execute GraphQL query
 * @param {object} variables
 * @returns {Promise}
 */
const executeGraphQLQuery = async (variables) => {
  return otp.graphql(TRIP_QUERY, variables);
};

/**
 * Query the planner with GraphQL
 * @param {TripRequest} tripRequest
 * @param {Date} tripRequest.whenTime
 * @param {object} preferences
 * @param {string} preferences.language
 * @param {number} queryId
 * @param {any} resolve
 * @param {any} reject
 */
const queryPlanner = async (tripRequest, preferences, queryId, resolve, reject) => {
  const whenTime = tripRequest.whenTime || new Date();
  let doExtraBikeQuery = false;

  const routeTypes = pickRouteTypes(tripRequest);

  const queries = routeTypes.map(routeType => {
    const date = formatters.datetime.asMDYYYY(whenTime);
    const time = formatters.datetime.asHMA(whenTime);

    const variables = {
      from: {
        lat: tripRequest.origin.point.lat,
        lon: tripRequest.origin.point.lng,
      },
      to: {
        lat: tripRequest.destination.point.lat,
        lon: tripRequest.destination.point.lng,
      },
      date,
      time,
      arriveBy: tripRequest.whenAction === 'arrive',
      wheelchair: tripRequest.hasRequirement('wheelchair') || false,
      numItineraries: 5,
      walkSpeed: 1.25,
      walkReluctance: preferences.minimizeWalking ? 15 : 75,
      waitReluctance: 0.6,
      transferPenalty: 300,
    };

    // Convert modes to TransportMode format
    const modes = RouteTypes[routeType];
    variables.transportModes = convertModesToTransportModes(modes);

    // Add flex modes if needed
    if (modes.includes('FLEXIBLE') || tripRequest.hasMode('flex')) {
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'DIRECT' });
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'ACCESS' });
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'EGRESS' });
    }

    // Walk distance limits
    if (preferences.maxWalk && modes.indexOf('BICYCLE') === -1) {
      variables.maxWalkDistance = preferences.maxWalk;
    }
    if (modes.includes('BICYCLE') || modes.includes('MICROMOBILITY_RENT')) {
      variables.maxWalkDistance = 3218.69; // 2 miles
      variables.bikeSpeed = 4.0; // ~9 mph
    }

    // Handle banned providers
    if (tripRequest.bannedProviders && tripRequest.bannedProviders.length > 0) {
      variables.bannedVehicleRentalNetworks = tripRequest.bannedProviders.map(p => p.toLowerCase());
    }

    // Route-specific settings
    if (routeType === 'rentBike' || routeType === 'rentBikeToTransit') {
      if (!tripRequest.hasMode('bike_rental')) {
        variables.bannedVehicleRentalNetworks = ['bike'];
      }
      else if (!tripRequest.hasMode('scooter')) {
        variables.bannedVehicleRentalNetworks = ['scooter'];
      }
      else {
        doExtraBikeQuery = modes.join(','); // Store as string like REST version
      }
    }
    else if (routeType === 'hail' || routeType === 'hailToTransit') {
      // if (tripRequest.sortBy === 'fastest') {
      //   // For flex routing, lower walk reluctance for fastest routes
      //   variables.walkReluctance = 1.0;
      // }
      // Add maxPreTransitTime equivalent through other parameters
      variables.transferPenalty = 0; // Reduce transfer penalty for hail routes
    }

    return executeGraphQLQuery(variables);
  });

  // Add extra bike query if needed
  if (doExtraBikeQuery) {
    const date = formatters.datetime.asMDYYYY(whenTime);
    const time = formatters.datetime.asHMA(whenTime);

    const variables = {
      from: {
        lat: tripRequest.origin.point.lat,
        lon: tripRequest.origin.point.lng,
      },
      to: {
        lat: tripRequest.destination.point.lat,
        lon: tripRequest.destination.point.lng,
      },
      date,
      time,
      arriveBy: tripRequest.whenAction === 'arrive',
      wheelchair: tripRequest.hasRequirement('wheelchair') || false,
      numItineraries: 5,
      walkSpeed: 1.25,
      walkReluctance: preferences.minimizeWalking ? 15 : 75,
      maxWalkDistance: 3218.69, // 2 miles
      transportModes: convertModesToTransportModes(doExtraBikeQuery.split(',')),
      bannedVehicleRentalNetworks: ['scooter'],
      waitReluctance: 0.6,
      transferPenalty: 300,
    };

    if (tripRequest.bannedProviders && tripRequest.bannedProviders.length > 0) {
      variables.bannedVehicleRentalNetworks = tripRequest.bannedProviders.map(p => p.toLowerCase());
    }

    queries.push(executeGraphQLQuery(variables));
  }

  try {
    const results = await Promise.all(queries);

    const allPlans = [];
    results.forEach((result, i) => {
      if (result.plan && result.plan.itineraries) {
        result.plan.itineraries.forEach((itinerary) => {
          const plan = convertGraphQLItinerary(itinerary, tripRequest, routeTypes[i]);
          plan.id = queryId; // Match REST behavior - use queryId directly
          
          if (filterPlan(plan, preferences, tripRequest.modes)) {
            allPlans.push(plan);
          }
        });
      }
    });

    resolve({
      plans: removeDuplicates(allPlans),
      id: queryId,
    });
  } catch (err) {
    console.error('GraphQL query error:', err);
    reject(err);
  }
};

/**
 * Convert GraphQL itinerary to OTP-style plan
 * @param {object} itinerary
 * @param {TripRequest} request
 * @param {string} routeType
 * @returns {object}
 */
const convertGraphQLItinerary = (itinerary, request, routeType) => {
  // Start with the original itinerary and modify it like the REST version
  const plan = { ...itinerary };

  // Convert GraphQL fields to match REST API format
  plan.startTime = new Date(itinerary.start).getTime();
  plan.endTime = new Date(itinerary.end).getTime();
  plan.routeType = routeType;

  // Remove GraphQL-specific fields that aren't in REST format
  delete plan.start;
  delete plan.end;

  // Map GraphQL field names to REST field names
  if (itinerary.numberOfTransfers !== undefined) {
    plan.transfers = itinerary.numberOfTransfers;
  }

  // Reset legs array for conversion
  plan.legs = [];

  // Note: This OTP instance doesn't provide fare data
  // Set default fare structure to maintain compatibility
  plan.fare = {
    details: {
      regular: [],
    },
  };

  // Initialize fields that scorePlan expects
  plan.price = 0;
  plan.displayPrice = 0;

  // Convert legs
  itinerary.legs.forEach(leg => {
    const convertedLeg = {
      startTime: new Date(leg.start.scheduledTime).getTime(),
      endTime: new Date(leg.end.scheduledTime).getTime(),
      duration: leg.duration,
      distance: leg.distance,
      mode: leg.mode.toUpperCase(),
      transitLeg: leg.transitLeg,
      realtime: leg.realTime,
      from: {
        name: leg.from.name,
        lon: leg.from.lon,
        lat: leg.from.lat,
        stopId: leg.from.stop?.gtfsId,
        stopCode: leg.from.stop?.code,
        vertexType: leg.from.stop ? 'TRANSIT' : 'NORMAL',
        departure: new Date(leg.start.scheduledTime).getTime(),
      },
      to: {
        name: leg.to.name,
        lon: leg.to.lon,
        lat: leg.to.lat,
        stopId: leg.to.stop?.gtfsId,
        stopCode: leg.to.stop?.code,
        vertexType: leg.to.stop ? 'TRANSIT' : 'NORMAL',
        arrival: new Date(leg.end.scheduledTime).getTime(),
      },
    };

    // Handle vehicle rental
    if (leg.from.vehicleRentalStation) {
      convertedLeg.from.bikeShareId = leg.from.vehicleRentalStation.stationId;
      convertedLeg.rentedBike = true;

      // Determine vehicle type from network name
      const rentalNetwork = leg.from.vehicleRentalStation.rentalNetwork;
      if (rentalNetwork && rentalNetwork.networkId) {
        const network = rentalNetwork.networkId.toLowerCase();
        if (network.includes('scooter')) {
          convertedLeg.vehicleType = 'scooter';
          convertedLeg.mode = 'SCOOTER';
        } else {
          convertedLeg.vehicleType = 'bike';
          convertedLeg.mode = 'BICYCLE';
        }
        convertedLeg.providerId = network;
      }
    }
    if (leg.to.vehicleRentalStation) {
      convertedLeg.to.bikeShareId = leg.to.vehicleRentalStation.stationId;
    }

    // Handle transit leg details
    if (leg.transitLeg && leg.route) {
      convertedLeg.routeId = leg.route.gtfsId;
      convertedLeg.routeShortName = leg.route.shortName;
      convertedLeg.routeLongName = leg.route.longName;
      convertedLeg.routeType = leg.route.type;
      convertedLeg.routeColor = leg.route.color;
      convertedLeg.routeTextColor = leg.route.textColor;
      convertedLeg.agencyId = leg.route.agency?.gtfsId;
      convertedLeg.agencyName = leg.route.agency?.name;
      convertedLeg.tripId = leg.trip?.gtfsId;
      convertedLeg.headsign = leg.trip?.tripHeadsign;
    }

    // Handle intermediate stops
    if (leg.intermediateStops && leg.intermediateStops.length > 0) {
      convertedLeg.intermediateStops = leg.intermediateStops.map(stop => ({
        name: stop.name,
        stopId: stop.gtfsId,
        lat: stop.lat,
        lon: stop.lon,
      }));
    }

    // Convert geometry
    if (leg.legGeometry && leg.legGeometry.points) {
      convertedLeg.legGeometry = {
        points: leg.legGeometry.points,
        length: leg.legGeometry.points.length,
      };
    }

    // Add steps if available
    if (leg.steps && Array.isArray(leg.steps)) {
      convertedLeg.steps = leg.steps;
    } else {
      convertedLeg.steps = [];
    }

    // Handle campus shuttle and demand-response services
    // Route type 715 is "Demand and Response Bus" in GTFS
    // GraphQL returns these as BUS mode, but they need to be HAIL for the app
    // Check if this is UB Shuttle based on route info
    if (leg.transitLeg && leg.route &&
        (leg.route.gtfsId?.includes('ub-1') ||
         leg.route.gtfsId?.includes('ub_shuttle') ||
         leg.route.longName?.toLowerCase().includes('ub shuttle') ||
         leg.route.shortName?.toLowerCase().includes('ub'))) {
      // This is UB Shuttle
      convertedLeg.mode = 'UBSHUTTLE';
      convertedLeg.hailedCar = false;
      convertedLeg.flexibleTransit = true;
      convertedLeg.tripId = 'UBS:A1'; // UB Shuttle identifier
      convertedLeg.providerId = 'ub_shuttle';
      convertedLeg.agencyId = 'ub-1';
      convertedLeg.agencyName = 'UB Shuttle';
    }
    // Check if this is Community Shuttle (HDS)
    else if (leg.transitLeg && leg.route &&
        (leg.route.type === 715 ||
         leg.route.gtfsId?.includes('campus_shuttle') ||
         (leg.route.longName?.toLowerCase().includes('shuttle') && 
          !leg.route.longName?.toLowerCase().includes('ub')))) {
      // This is a flex/shuttle service that needs to be hailed
      convertedLeg.mode = 'HAIL';
      convertedLeg.hailedCar = true;
      convertedLeg.flexibleTransit = true;
      convertedLeg.tripId = 'HDS:A1'; // Human-Driven Shuttle identifier
      convertedLeg.providerId = 'campus_shuttle';
    }

    // Handle UB Shuttle for FLEX mode
    if (leg.mode === 'FLEX' && (routeType === 'ubshuttle' || routeType === 'ubshuttleToTransit')) {
      convertedLeg.mode = 'UBSHUTTLE';
      convertedLeg.hailedCar = false;
      convertedLeg.tripId = 'UBS:A1';
      convertedLeg.providerId = 'ub_shuttle';
      convertedLeg.agencyId = 'ub-1';
      convertedLeg.agencyName = 'UB Shuttle';
    }

    // Handle actual car hail (ride-sharing services)
    if (leg.mode === 'CAR' && (routeType === 'hailToTransit' || routeType === 'hail')) {
      convertedLeg.mode = 'HAIL';
      convertedLeg.hailedCar = true;
      convertedLeg.tripId = 'HDS:A1';
    }

    plan.legs.push(convertedLeg);
  });

  // Apply route color processing like REST version
  plan.legs.forEach(leg => {
    if (leg.routeColor && !leg.routeColor.startsWith('#')) {
      leg.routeColor = '#' + leg.routeColor;
    }
    if (leg.routeTextColor && !leg.routeTextColor.startsWith('#')) {
      leg.routeTextColor = '#' + leg.routeTextColor;
    }
  });

  // calcCost(plan);
  scorePlan(plan, request);

  return plan;
};

const RouteTypes = {
  walk: ['WALK'],
  bike: ['BICYCLE'],
  rentBike: ['WALK', 'MICROMOBILITY_RENT'],
  drive: ['CAR'],
  carParkAndRide: ['CAR_PARK', 'WALK', 'TRANSIT'],
  bikeParkAndRide: ['BICYCLE_PARK', 'WALK', 'TRANSIT'],
  // For backwards compatibility: hail now uses FLEXIBLE for shuttle service
  hail: ['FLEXIBLE', 'WALK'],
  hailToTransit: ['FLEXIBLE', 'WALK', 'TRANSIT'],
  // UB Shuttle uses FLEXIBLE mode like Community Shuttle
  ubshuttle: ['UBSHUTTLE', 'WALK'],
  ubshuttleToTransit: ['UBSHUTTLE', 'WALK', 'TRANSIT'],
  walkToTransit: ['TRANSIT', 'WALK'],
  bikeToTransit: ['TRANSIT', 'BICYCLE'],
  rentBikeToTransit: ['TRANSIT', 'WALK', 'MICROMOBILITY_RENT'],
  flexToTransit: ['TRANSIT', 'WALK', 'FLEXIBLE'],
  flexDirect: ['WALK', 'FLEXIBLE'],
};

/**
 * Pick route types based on selected modes
 * @param {TripRequest} trip
 * @returns {string[]}
 */
const pickRouteTypes = (trip) => {
  const modeSets = [];

  // Check for flex service
  const hasFlexService = trip.hasMode('flex') || trip.hasMode('flexible');

  if (trip.hasMode('bus') || trip.hasMode('tram')) {
    if (hasFlexService) {
      modeSets.push('flexToTransit');
    }
    if (trip.hasMode('car')) {
      modeSets.push('carParkAndRide');
      modeSets.push('drive');
    }
    if (trip.hasMode('hail')) {
      modeSets.push('hailToTransit');
      modeSets.push('hail');
    }
    if (trip.hasMode('ubshuttle')) {
      modeSets.push('ubshuttleToTransit');
      modeSets.push('ubshuttle');
    }
    if (trip.hasMode('bike') || trip.hasMode('bicycle')) {
      modeSets.push('bikeToTransit');
    }
    if (trip.hasMode('scooter') || trip.hasMode('bike_rental')) {
      modeSets.push('rentBikeToTransit');
    }
    modeSets.push('walkToTransit');
  } else {
    if (hasFlexService) {
      modeSets.push('flexDirect');
    }
    if (trip.hasMode('car')) {
      modeSets.push('drive');
    }
    if (trip.hasMode('hail')) {
      modeSets.push('hail');
    }
    if (trip.hasMode('ubshuttle')) {
      modeSets.push('ubshuttle');
    }
    if (trip.hasMode('bike') || trip.hasMode('bicycle')) {
      modeSets.push('bike');
    }
    if (trip.hasMode('scooter') || trip.hasMode('bike_rental')) {
      modeSets.push('rentBike');
    } else if (!trip.hasMode('hail') && !trip.hasMode('ubshuttle')) {
      modeSets.push('walk');
    }
  }
  return modeSets;
};

/**
 * Remove duplicate plans
 * @param {object[]} planList
 * @returns {object[]}
 */
const removeDuplicates = (planList) => {
  for (var i = 0; i < planList.length; i++) {
    var planI = planList[i];
    for (var j = planList.length - 1; j > i; j--) {
      var planJ = planList[j];
      if (plansEqual(planI, planJ)) {
        planList.splice(j, 1);
      } else if (plansSimilar(planI, planJ)) {
        if (planI.routeType !== 'walkToTransit') {
          planList.splice(i, 1);
          --i;
          break;
        } else if (planJ.routeType !== 'walkToTransit') {
          planList.splice(j, 1);
        }
      }
    }
  }
  return planList;
};

/**
 * Check if two plans are equal
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
const plansEqual = (a, b) => {
  if (a.startTime !== b.startTime || a.endTime !== b.endTime || a.legs.length !== b.legs.length) {
    return false;
  }
  for (var i = a.legs.length; i--;) {
    if (a.legs[i].mode !== b.legs[i].mode || a.legs[i].providerId !== b.legs[i].providerId) {
      return false;
    }
  }
  return true;
};

/**
 * Check if two plans are similar
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
const plansSimilar = (a, b) => {
  if (a.legs.length !== b.legs.length) {
    return false;
  }
  for (var i = a.legs.length; i--;) {
    const al = a.legs[i], bl = b.legs[i];
    if (al.mode !== bl.mode || al.providerId !== bl.providerId) {
      return false;
    }
    if (al.mode !== 'WALK' && (Math.abs(al.startTime - bl.startTime) > 15000 || Math.abs(al.endTime - bl.endTime) > 15000)) {
      return false;
    }
  }
  return true;
};

/**
 * Calculate cost for a plan - currently unused but kept for future implementation
 * @param {object} plan
 */
// eslint-disable-next-line no-unused-vars
const calcCost = (plan) => {
  let firstFare = plan.fare && plan.fare.details?.regular && plan.fare.details.regular.length > 0 ? plan.fare.details.regular[0].price.cents : 0;
  let cents = plan.price = firstFare;
  let displayCents = cents;
  let busAdded = false;
  let didUseCogo = false;

  plan.legs.forEach(leg => {
    if (leg.mode === 'CAR') {
      leg.price = leg.distance * 3.28084 * 60 / 5280;
      cents += leg.price;
    }
    else if (leg.mode === 'HAIL') {
      cents += leg.price || 0;
      displayCents += leg.price || 0;
    }
    else if (leg.mode === 'SCOOTER') {
      leg.price = leg.duration * 15 / 60; // 15 cents per minute
      leg.price += 100; // scooter start fee
      cents += leg.price;
      displayCents += leg.price;
    }
    else if (leg.mode === 'BICYCLE') {
      leg.price = 0;
      if (leg.providerId === 'cogo') {
        if (!didUseCogo) {
          leg.price = 800; // COGO start fee
          didUseCogo = true;
        }
        if (leg.duration > 1800) { // Add $3 every 30 minutes after the first
          const blocks = Math.ceil((leg.duration - 1800) / 1800);
          leg.price += blocks * 300;
        }
      }
      cents += leg.price;
      displayCents += leg.price;
    }
    else if (leg.mode === 'WALK') {
      leg.price = 0;
    }
    else if (leg.mode === 'BUS') {
      if (!busAdded) {
        leg.price = firstFare;
        busAdded = true;
      }
      else if (busAdded && plan.fare && plan.fare.details?.regular) {
        var found = plan.fare.details.regular.find((f) => {
          return f.routes && f.routes.indexOf(leg.routeId) > -1;
        });
        if (found && found.price && found.price.cents > firstFare) {
          leg.price = found.price.cents - firstFare;
          cents += found.price.cents - firstFare;
          displayCents += found.price.cents - firstFare;
        }
      }
    }
  });
  plan.price = (cents || 0) / 100;
  plan.displayPrice = (displayCents || 0) / 100;
};

/**
 * Score plan based on user preferences
 * @param {object} plan
 * @param {TripRequest} request
 */
const scorePlan = (plan, request) => {
  // Factor wait time before or after trip into the total trip time
  let delay = 0;
  var requestTime;
  if (isNaN(request.whenTime)) {
    requestTime = (request.whenTime || new Date()).getTime();
  } else {
    requestTime = request.whenTime;
  }
  const arriveBy = request.whenAction === 'arrive';
  if (arriveBy) {
    delay = requestTime - plan.endTime;
  } else {
    delay = plan.startTime - requestTime;
  }

  // Penalize delay at some relative cost to trip time
  plan.delay = Math.round(delay / 1000);
  plan.timeScore = plan.duration + plan.delay / 3;

  // Penalize $1 for every 10 mins
  plan.score = plan.price + plan.timeScore / 60 / 10;

  // Calculate eco harm
  plan.ecoHarm = 0;
  plan.legs.forEach(leg => {
    if (leg.mode === 'CAR' || leg.mode === 'HAIL') {
      plan.ecoHarm += leg.duration * 10 / 60;
    } else if (leg.mode === 'BUS') {
      plan.ecoHarm += leg.duration * 1 / 60;
    }
  });
};

/**
 * Filter plans based on preferences
 * @param {object} plan
 * @param {object} preferences
 * @param {string[]} modes
 * @returns {boolean}
 */
const filterPlan = (plan, preferences, modes) => {
  for (var i = plan.legs.length; i--;) {
    if (plan.legs[i].providerDown) { return false; }
    if (modes.indexOf(plan.legs[i].mode.toLowerCase()) === -1) { return false; }
  }
  if (plan.displayPrice > preferences.maxCost) {
    return false;
  }
  if (plan.legs.length === 1 && plan.legs[0].mode.toLowerCase() === 'bicycle') {
    return true;
  }
  if (
    preferences.minimizeWalking
    && plan.walkDistance > 804.672
  ) {
    return false;
  }
  return true;
};
