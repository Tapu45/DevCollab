/**
 * Utility functions to get user's location and timezone using ipgeolocation.io API.
 * Uses IP-based lookup (no browser permission required).
 */

export type LocationResult = {
  location: string;      // "City, Country"
  timezone: string;      // "Asia/Kolkata"
  lat: number;
  lng: number;
};

const IPGEOLOCATION_API_KEY = 'a2113b183e88459e8c01b723a8cc67b7';

/**
 * Fetch location and timezone info from ipgeolocation.io API.
 */
export async function getLocationAndTimezone(): Promise<LocationResult> {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch location info');
  const data = await res.json();

  return {
    location: `${data.city}, ${data.country_name}`,
    timezone: data.time_zone?.name || '',
    lat: parseFloat(data.latitude),
    lng: parseFloat(data.longitude),
  };
}