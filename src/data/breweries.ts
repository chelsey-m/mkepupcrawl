import { Location } from '../types';

export const breweries: Omit<Location, 'id'>[] = [
  {
    name: "Amorphic Beer",
    type: "both",
    coordinates: [43.0789, -87.9026],
    yelpLink: "https://www.amorphicbeer.com/",
    address: "3700 N Fratney St, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Perspective Brewing",
    type: "both",
    coordinates: [43.0167, -88.0073],
    yelpLink: "https://www.yelp.com/biz/perspective-brewing-west-allis",
    address: "7508 W Greenfield Ave, West Allis, WI",
    rating: 4
  },
  {
    name: "Black Husky Brewing",
    type: "both",
    coordinates: [43.0714, -87.8997],
    yelpLink: "https://blackhuskybrewing.com/",
    address: "909 E Locust St, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Gathering Place Brewing",
    type: "both",
    coordinates: [43.0784, -87.8947],
    yelpLink: "https://www.gatheringplacebrewing.com/",
    address: "811 E Vienna Ave, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Component Brewing",
    type: "both",
    coordinates: [43.0178, -87.9129],
    yelpLink: "https://www.facebook.com/ComponentBrewing/",
    address: "2018 S 1st St #169, Milwaukee, WI",
    rating: 4
  },
  {
    name: "New Barons Brewing Co-op",
    type: "both",
    coordinates: [43.0178, -87.9129],
    yelpLink: "https://newbaronsbrewing.com/",
    address: "2018 S 1st St #170, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Broken Bat Brewing Co",
    type: "both",
    coordinates: [43.0241, -87.9066],
    yelpLink: "https://brokenbatbrewery.com/",
    address: "135 E Pittsburgh Ave, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Enlightened Brewing Co",
    type: "both",
    coordinates: [43.0169, -87.9129],
    yelpLink: "https://enlightenedbeer.com/",
    address: "2020 S Allis St, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Third Space Brewing",
    type: "outdoor",
    coordinates: [43.0317, -87.9431],
    yelpLink: "https://thirdspacebrewing.com/",
    address: "1505 W St Paul Ave, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Eagle Park Brewing Co",
    type: "outdoor",
    coordinates: [43.0474, -87.8972],
    yelpLink: "https://www.yelp.com/biz/eagle-park-brewing-milwaukee",
    address: "823 E Hamilton St, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Lakefront Brewery",
    type: "outdoor",
    coordinates: [43.0533, -87.9054],
    yelpLink: "https://lakefrontbrewery.com/",
    address: "1872 N Commerce St, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Good City Brewing Co",
    type: "outdoor",
    coordinates: [43.0600, -87.8876],
    yelpLink: "https://www.goodcitybrewing.com/",
    address: "2108 N Farwell Ave, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Vennture Brew Co",
    type: "both",
    coordinates: [43.0606, -87.9816],
    yelpLink: "https://www.yelp.com/biz/vennture-brew-company-milwaukee",
    address: "5519 W North Ave, Milwaukee, WI",
    rating: 4
  },
  {
    name: "Hacienda Beer Co",
    type: "outdoor",
    coordinates: [43.0600, -87.8876],
    yelpLink: "https://www.haciendabeerco.com/",
    address: "2018 E North Ave, Milwaukee, WI",
    rating: 4
  }
];