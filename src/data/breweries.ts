import { Location, VerifiedBrewery } from '../types';
import breweriesJson from './mke_breweries_all_21.json';

// Log raw JSON data for verification
console.log('Raw brewery data:', breweriesJson);

// Convert JSON data to Location format
const convertBreweryData = (brewery: VerifiedBrewery): Omit<Location, 'id'> => {
  const location = {
    name: brewery.name,
    type: brewery.tags.includes('Indoor') && brewery.tags.includes('Outdoor') 
      ? 'both' 
      : brewery.tags.includes('Indoor') 
        ? 'indoor' 
        : 'outdoor',
    coordinates: [brewery.latitude, brewery.longitude] as [number, number],
    yelpLink: brewery.yelp,
    address: brewery.address,
    rating: brewery.pawRating
  };

  // Log each brewery's conversion
  console.log(`Converting ${brewery.name}:`, {
    original: { lat: brewery.latitude, lng: brewery.longitude },
    converted: location.coordinates
  });

  return location;
};

export const breweries: Omit<Location, 'id'>[] = breweriesJson.map(convertBreweryData);

// Log final brewery data
console.log('Processed brewery locations:');
breweries.forEach(brewery => {
  console.log(`${brewery.name}:`, {
    coordinates: brewery.coordinates,
    type: brewery.type,
    address: brewery.address
  });
});