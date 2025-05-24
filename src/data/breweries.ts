import { Location } from '../types';

// For now, we'll keep the existing structure but use the verified coordinates
// Once you provide the complete JSON file, we can update the entire data structure
export const breweries: Omit<Location, 'id'>[] = [
  {
    name: "Milwaukee Brewing Company",
    type: "both",
    coordinates: [42.997142, -87.904026],
    yelpLink: "https://www.yelp.com/biz/milwaukee-brewing-company-milwaukee-2",
    address: "2335 S Kinnickinnic Ave, Milwaukee, WI 53207",
    rating: 4
  },
  {
    name: "Sugar Maple",
    type: "outdoor",
    coordinates: [42.996197, -87.903406],
    yelpLink: "https://www.yelp.com/biz/sugar-maple-milwaukee",
    address: "441 E Lincoln Ave, Milwaukee, WI 53207",
    rating: 4
  },
  {
    name: "1840 Brewing Company",
    type: "outdoor",
    coordinates: [42.994653, -87.899987],
    yelpLink: "https://www.yelp.com/biz/1840-brewing-company-milwaukee",
    address: "342 E Ward St, Milwaukee, WI 53207",
    rating: 4
  },
  {
    name: "Burnhearts",
    type: "outdoor",
    coordinates: [42.998591, -87.903309],
    yelpLink: "https://www.yelp.com/biz/burnhearts-milwaukee",
    address: "2599 S Logan Ave, Milwaukee, WI 53207",
    rating: 4
  },
  {
    name: "Torzala Brewing Company",
    type: "indoor",
    coordinates: [42.996128, -87.901768],
    yelpLink: "https://www.yelp.com/biz/torzala-brewing-company-milwaukee",
    address: "2018 S 1st St Suite 207, Milwaukee, WI 53207",
    rating: 4
  },
  {
    name: "Enlightened Brewing Co",
    type: "indoor",
    coordinates: [42.995980, -87.901493],
    yelpLink: "https://enlightenedbeer.com/",
    address: "2020 S Allis St, Milwaukee, WI 53207",
    rating: 4
  }
];