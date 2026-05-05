import axios from 'axios';

/**
 * Fetches the actual road distance between two points using OSRM.
 * Returns distance in kilometers.
 * Falls back to Haversine distance if API fails.
 */
export const getRoadDistance = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<number> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
    const response = await axios.get(url);

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      return distanceInMeters / 1000; // Convert to km
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('OSRM Routing Error, falling back to Haversine:', error);
    // Fallback to Haversine
    return calculateHaversineDistance(startLat, startLng, endLat, endLng);
  }
};

/**
 * Simple Haversine fallback
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
