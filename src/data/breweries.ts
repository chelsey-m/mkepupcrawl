import { Location, VerifiedBrewery } from '../types';
import breweriesJson from './mke_breweries_all_21.json';

// Convert JSON data to Location format
const convertBreweryData = (brewery: VerifiedBrewery): Omit<Location, 'id'> => {
  return {
    name: brewery.name,
    type: brewery.tags.includes('Indoor') && brewery.tags.includes('Outdoor') 
      ? 'both' 
      : brewery.tags.includes('Indoor') 
        ? 'indoor' 
        : 'outdoor',
    coordinates: [brewery.latitude, brewery.longitude],
    yelpLink: brewery.yelp,
    address: brewery.address,
    rating: brewery.pawRating
  };
};

export const breweries: Omit<Location, 'id'>[] = breweriesJson.map(convertBreweryData);

console.log('Loaded breweries with coordinates:');
breweries.forEach(brewery => {
  console.log(`${brewery.name}: [${brewery.coordinates[0]}, ${brewery.coordinates[1]}]`);
});