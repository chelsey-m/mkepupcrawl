import { Location, VerifiedBrewery } from '../types';
import breweriesJson from './mke_breweries_all_21.json';

// Convert JSON data to Location format
const convertBreweryData = (brewery: VerifiedBrewery): Omit<Location, 'id'> => {
  console.log(`Loading brewery: ${brewery.name} at [${brewery.latitude}, ${brewery.longitude}]`);
  
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

console.log(`Loaded ${breweries.length} breweries from verified data source`);