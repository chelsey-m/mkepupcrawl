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
    coordinates: [brewery.latitude, brewery.longitude] as [number, number],
    yelpLink: brewery.yelp,
    address: brewery.address,
    rating: brewery.pawRating
  };
};

export const breweries: Omit<Location, 'id'>[] = breweriesJson.map(convertBreweryData);

// Detailed coordinate logging
console.log('=== Brewery Coordinates Verification ===');
console.log('Total breweries loaded:', breweries.length);
console.log('\nLakefront Brewery Details:');
const lakefront = breweries.find(b => b.name === 'Lakefront Brewery');
console.log('Name:', lakefront?.name);
console.log('Coordinates:', lakefront?.coordinates);
console.log('Address:', lakefront?.address);

console.log('\nAll Brewery Coordinates:');
breweries.forEach(brewery => {
  console.log(`${brewery.name}:`);
  console.log(`  Coordinates: [${brewery.coordinates[0]}, ${brewery.coordinates[1]}]`);
  console.log(`  Address: ${brewery.address}\n`);
});