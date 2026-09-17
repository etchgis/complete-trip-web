import TripRequest from './trip-request';
import formatters from '../utils/formatters';
import { otp } from '../services/transport';

// Cache for agency mappings
let agencyMappingsCache = null;

// GraphQL query for fetching agencies
const AGENCIES_QUERY = `
query {
  agencies {
    gtfsId
    name
  }
}`;

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
  $allowKeepingRentedBicycleAtDestination: Boolean,
  $banned: InputBanned
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
    banned: $banned
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
 * @param {TripRequest} tripRequest
 * @returns {object[]}
 */
const convertModesToTransportModes = (modes, tripRequest) => {
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
        // Only add the transit modes that are actually selected (matches native app)
        const hasBus = tripRequest?.hasMode('bus') || tripRequest?.hasMode('ubshuttle');
        const hasTram = tripRequest?.hasMode('tram') || tripRequest?.hasMode('rail');
        
        if (hasBus) {
          transportModes.push({ mode: 'BUS' });
        }
        if (hasTram) {
          transportModes.push({ mode: 'TRAM' });
        }
        break;
      case 'FLEXIBLE':
        transportModes.push({ mode: 'FLEX', qualifier: 'DIRECT' });
        transportModes.push({ mode: 'FLEX', qualifier: 'ACCESS' });
        transportModes.push({ mode: 'FLEX', qualifier: 'EGRESS' });
        break;
    }
  });

  return transportModes;
};

/**
 * Fetch agencies from the server
 * @returns {Promise<object>}
 */
const fetchAgencyMappings = async () => {
  if (agencyMappingsCache) {
    return agencyMappingsCache;
  }

  try {
    const result = await otp.graphql(AGENCIES_QUERY, {});

    if (result && result.agencies) {
      const mappings = {
        toFeed: {},  // simple -> feed-prefixed
        fromFeed: {},  // feed-prefixed -> simple
      };

      result.agencies.forEach((agency) => {
        const gtfsId = agency.gtfsId;
        const name = agency.name;

        // Extract simple name (part after colon)
        const simpleName = gtfsId.includes(':') ? gtfsId.split(':')[1] : gtfsId;

        // Map both directions
        mappings.toFeed[simpleName] = gtfsId;
        mappings.toFeed[simpleName.toLowerCase()] = gtfsId;
        mappings.toFeed[gtfsId] = gtfsId; // passthrough

        mappings.fromFeed[gtfsId] = simpleName;

        // Also map by agency name if different
        if (name && name !== simpleName) {
          mappings.toFeed[name] = gtfsId;
          mappings.toFeed[name.toLowerCase()] = gtfsId;
        }
      });

      agencyMappingsCache = mappings;
      console.log('Fetched agency mappings:', mappings);
      return mappings;
    }
  } catch (error) {
    console.error('Failed to fetch agency mappings:', error.message);
  }

  // Return empty mappings if fetch fails
  return { toFeed: {}, fromFeed: {} };
};

/**
 * Convert simple agency names to feed-prefixed IDs
 * @param {string[]} agencies
 * @returns {Promise<string[]>}
 */
const mapAgenciesToFeed = async (agencies) => {
  if (!Array.isArray(agencies)) {
    return [];
  }

  const mappings = await fetchAgencyMappings();

  return agencies.map(agency => {
    const mapped = mappings.toFeed[agency];
    return mapped || agency;
  });
};

/**
 * Convert feed-prefixed agency IDs to simple names
 * @param {string} agencyId
 * @param {object} mappings
 * @returns {string}
 */
const mapAgencyFromFeed = (agencyId, mappings) => {
  if (!agencyId) return agencyId;
  const mapped = mappings.fromFeed[agencyId];
  return mapped || agencyId;
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

  const queries = routeTypes.map(async routeType => {
    const dt = whenTime instanceof Date ? whenTime : new Date(whenTime);
    const date = dt.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = dt.toTimeString().split(' ')[0]; // HH:MM:SS

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
      wheelchair: preferences.wheelchair || false,
      numItineraries: 5,
      walkSpeed: 1.25,
      walkReluctance: preferences.minimizeWalking ? 2 : 10,
      waitReluctance: 0.8,
      transferPenalty: 300,
    };

    // Convert modes to TransportMode format
    const modes = RouteTypes[routeType];
    variables.transportModes = convertModesToTransportModes(modes, tripRequest);

    // Add flex modes if needed
    if (modes.includes('FLEXIBLE') || tripRequest.hasMode('flex')) {
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'DIRECT' });
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'ACCESS' });
      variables.transportModes.push({ mode: 'FLEX', qualifier: 'EGRESS' });
    }

    // Handle agency banning (matches native app)
    const agenciesToBan = [];
    
    // Ban MET if no rail/tram modes selected
    if (!tripRequest.hasMode('tram') && !tripRequest.hasMode('rail')) {
      agenciesToBan.push('MET');
    }
    
    // Ban NFTA if no bus mode selected
    if (!tripRequest.hasMode('bus')) {
      agenciesToBan.push('NFTA');
    }
    
    // Ban ub-1 if no ubshuttle mode selected
    if (!tripRequest.hasMode('ubshuttle')) {
      agenciesToBan.push('ub-1');
    }
    
    // Ban BNMC if no hail mode selected
    if (!tripRequest.hasMode('hail')) {
      agenciesToBan.push('BNMC');
    }
    
    // Apply agency bans
    if (agenciesToBan.length > 0) {
      const bannedAgencies = await mapAgenciesToFeed(agenciesToBan);
      variables.banned = {
        agencies: bannedAgencies.join(',')
      };
    }

    // Walk distance limits
    if (preferences.maxWalk && modes.indexOf('BICYCLE') === -1) {
      variables.maxWalkDistance = preferences.maxWalk;
    }
    if (modes.includes('BICYCLE') || modes.includes('MICROMOBILITY_RENT')) {
      variables.maxWalkDistance = 3218.69; // 2 miles
      variables.bikeSpeed = 4.0; // ~9 mph
    }

    // Handle regular transit without UB Shuttle
    if ((tripRequest.hasMode('bus') || tripRequest.hasMode('tram')) && routeType === 'walkToTransit') {
      variables.walkReluctance = 200;
    }

    // Set high walk reluctance for all transit routes
    if (routeType === 'walkToTransit' || routeType === 'bikeToTransit') {
      variables.walkReluctance = 200;
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
      plans: calculateShortest(removeDuplicates(allPlans)),
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
      // Map agency ID to simple name
      const agencyId = leg.route.agency?.gtfsId;
      if (agencyId) {
        // We need mappings passed to this function
        convertedLeg.agencyId = agencyId.includes(':') ? agencyId.split(':')[1] : agencyId;
      }
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
    // Handle AAL shuttle - BUS mode with ub-1 agency
    if (leg.mode === 'BUS' && convertedLeg.agencyId === 'ub-1') {
      // This is AAL shuttle - convert to 'ubshuttle' mode
      convertedLeg.mode = 'ubshuttle';
      convertedLeg.flexibleTransit = true;
      convertedLeg.tripId = 'HDS:A1'; // Human-Driven Shuttle identifier
      convertedLeg.providerId = 'campus_shuttle';
      // Override route short name to display 'AAL' instead of 'UB-1'
      convertedLeg.routeShortName = 'AAL';
    }

    // Handle community shuttle and other demand-response services
    // Route type 715 is "Demand and Response Bus" in GTFS
    if (leg.transitLeg && leg.route && leg.route.type === 715) {
      // This is community shuttle or other flex service - convert to HAIL
      convertedLeg.mode = 'HAIL';
      convertedLeg.hailedCar = true;
      convertedLeg.flexibleTransit = true;
      convertedLeg.tripId = 'HDS:A1'; // Human-Driven Shuttle identifier
      convertedLeg.providerId = 'campus_shuttle';
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

  if (trip.hasMode('bus') || trip.hasMode('tram') || trip.hasMode('ubshuttle')) {
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
    if (trip.hasMode('bike') || trip.hasMode('bicycle')) {
      modeSets.push('bike');
    }
    if (trip.hasMode('scooter') || trip.hasMode('bike_rental')) {
      modeSets.push('rentBike');
    } else if (!trip.hasMode('hail')) {
      modeSets.push('walk');
    }
  }
  return modeSets;
};

/**
 * Calculate shortest plans
 * @param {object[]} plans
 * @returns {object[]}
 */
const calculateShortest = (plans) => {
  if (!plans || plans.length === 0) return plans;
  
  // Find the shortest duration
  let shortestDuration = Number.MAX_VALUE;
  plans.forEach(plan => {
    if (plan.duration < shortestDuration) {
      shortestDuration = plan.duration;
    }
  });
  
  // Mark plans that are within 10% of shortest as "shortest"
  plans.forEach(plan => {
    if (plan.duration <= shortestDuration * 1.1) {
      plan.isShortest = true;
    }
  });
  
  return plans;
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
