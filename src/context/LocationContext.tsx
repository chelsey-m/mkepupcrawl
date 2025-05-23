import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Location, Plan, Filter } from '../types';
import { breweries } from '../data/breweries';

interface LocationContextType {
  locations: Location[];
  filteredLocations: Location[];
  selectedLocation: Location | null;
  filter: Filter;
  plans: Plan[];
  activePlan: Plan | null;
  isLoading: boolean;
  addLocation: (location: Omit<Location, 'id'>) => void;
  selectLocation: (locationId: string | null) => void;
  setFilter: (filter: Filter) => void;
  createPlan: (name: string) => void;
  addLocationToPlan: (locationId: string) => void;
  removeLocationFromPlan: (locationId: string) => void;
  reorderPlanLocations: (startIndex: number, endIndex: number) => void;
  selectPlan: (planId: string | null) => void;
  sendReport: (locationId: string, issue: string, email?: string) => Promise<boolean>;
  updatePlanNotes: (notes: string) => void;
  generateShareCode: () => string;
  loadSharedPlan: (shareCode: string) => Plan | null;
  exportToGoogleMaps: () => string;
  updateLocationRating: (locationId: string, rating: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocations = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
};

const STORAGE_KEY = 'mkePupCrawl_plans';
const RATINGS_KEY = 'mkePupCrawl_ratings';

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filter, setFilter] = useState<Filter>({ type: 'all', minRating: 0 });
  const [plans, setPlans] = useState<Plan[]>(() => {
    const savedPlans = localStorage.getItem(STORAGE_KEY);
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locations with brewery data
  useEffect(() => {
    const initializeLocations = async () => {
      setIsLoading(true);
      try {
        const uniqueBreweries = new Map();
        
        breweries.forEach(brewery => {
          const key = `${brewery.name}-${brewery.coordinates.join(',')}`;
          if (!uniqueBreweries.has(key)) {
            uniqueBreweries.set(key, {
              ...brewery,
              id: nanoid()
            });
          }
        });

        const initialLocations = Array.from(uniqueBreweries.values());

        // Load custom ratings
        const savedRatings = localStorage.getItem(RATINGS_KEY);
        if (savedRatings) {
          const customRatings = JSON.parse(savedRatings);
          initialLocations.forEach(location => {
            if (customRatings[location.id]) {
              location.rating = customRatings[location.id];
            }
          });
        }

        setLocations(initialLocations);
      } catch (error) {
        console.error('Error initializing locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocations();
  }, []);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation = {
      ...location,
      id: nanoid(),
    };
    
    // Check if location already exists by name and coordinates
    const exists = locations.some(loc => 
      loc.name === newLocation.name && 
      loc.coordinates[0] === newLocation.coordinates[0] && 
      loc.coordinates[1] === newLocation.coordinates[1]
    );
    
    if (!exists) {
      setLocations(prev => [...prev, newLocation]);
    }
  };

  // Filter locations based on the selected filter
  const filteredLocations = locations.filter(location => {
    if (filter.type !== 'all' && filter.type !== location.type && 
        !(filter.type === 'indoor' && location.type === 'both') && 
        !(filter.type === 'outdoor' && location.type === 'both')) {
      return false;
    }
    
    if (filter.minRating && location.rating < filter.minRating) {
      return false;
    }
    
    return true;
  });

  const updateLocationRating = (locationId: string, rating: number) => {
    setLocations(prevLocations =>
      prevLocations.map(location =>
        location.id === locationId ? { ...location, rating } : location
      )
    );

    if (selectedLocation?.id === locationId) {
      setSelectedLocation(prev => prev ? { ...prev, rating } : null);
    }

    const savedRatings = localStorage.getItem(RATINGS_KEY);
    const ratings = savedRatings ? JSON.parse(savedRatings) : {};
    ratings[locationId] = rating;
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  };

  const selectLocation = (locationId: string | null) => {
    if (locationId === null) {
      setSelectedLocation(null);
      return;
    }
    
    const location = locations.find(loc => loc.id === locationId);
    setSelectedLocation(location || null);
  };

  const createPlan = (name: string) => {
    const newPlan = {
      id: nanoid(),
      name,
      locations: [],
      createdAt: new Date().toISOString(),
    };
    setPlans(prev => [...prev, newPlan]);
    setActivePlan(newPlan);
  };

  const addLocationToPlan = (locationId: string) => {
    if (!activePlan) return;
    
    if (activePlan.locations.includes(locationId)) return;
    
    const updatedPlan = {
      ...activePlan,
      locations: [...activePlan.locations, locationId],
    };
    
    setPlans(prev => prev.map(plan => 
      plan.id === activePlan.id ? updatedPlan : plan
    ));
    
    setActivePlan(updatedPlan);
  };

  const removeLocationFromPlan = (locationId: string) => {
    if (!activePlan) return;
    
    const updatedPlan = {
      ...activePlan,
      locations: activePlan.locations.filter(id => id !== locationId),
    };
    
    setPlans(prev => prev.map(plan => 
      plan.id === activePlan.id ? updatedPlan : plan
    ));
    
    setActivePlan(updatedPlan);
  };

  const reorderPlanLocations = (startIndex: number, endIndex: number) => {
    if (!activePlan) return;
    
    const updatedLocations = [...activePlan.locations];
    const [removed] = updatedLocations.splice(startIndex, 1);
    updatedLocations.splice(endIndex, 0, removed);
    
    const updatedPlan = {
      ...activePlan,
      locations: updatedLocations,
    };
    
    setPlans(prev => prev.map(plan => 
      plan.id === activePlan.id ? updatedPlan : plan
    ));
    
    setActivePlan(updatedPlan);
  };

  const selectPlan = (planId: string | null) => {
    if (planId === null) {
      setActivePlan(null);
      return;
    }
    
    const plan = plans.find(p => p.id === planId);
    setActivePlan(plan || null);
  };

  const updatePlanNotes = (notes: string) => {
    if (!activePlan) return;

    const updatedPlan = {
      ...activePlan,
      notes,
    };

    setPlans(prev => prev.map(plan =>
      plan.id === activePlan.id ? updatedPlan : plan
    ));

    setActivePlan(updatedPlan);
  };

  const generateShareCode = () => {
    if (!activePlan) return '';

    const shareCode = nanoid(10);
    const updatedPlan = {
      ...activePlan,
      shareCode,
    };

    setPlans(prev => prev.map(plan =>
      plan.id === activePlan.id ? updatedPlan : plan
    ));

    setActivePlan(updatedPlan);
    return shareCode;
  };

  const loadSharedPlan = (shareCode: string): Plan | null => {
    const sharedPlan = plans.find(plan => plan.shareCode === shareCode);
    return sharedPlan || null;
  };

  const exportToGoogleMaps = () => {
    if (!activePlan) return '';

    const planLocations = activePlan.locations
      .map(id => locations.find(loc => loc.id === id))
      .filter(Boolean) as Location[];

    if (planLocations.length === 0) return '';

    const addresses = planLocations.map(loc => 
      encodeURIComponent(loc.address || `${loc.coordinates[0]},${loc.coordinates[1]}`)
    );

    return `https://www.google.com/maps/dir/${addresses.join('/')}`;
  };

  const sendReport = async (locationId: string, issue: string, email?: string): Promise<boolean> => {
    const location = locations.find(loc => loc.id === locationId);
    
    console.log('REPORT:', {
      location: location?.name,
      issue,
      contactEmail: email || 'Not provided',
      to: 'chelsey.madsen@gmail.com'
    });
    
    return true;
  };

  const value = {
    locations,
    filteredLocations,
    selectedLocation,
    filter,
    plans,
    activePlan,
    isLoading,
    addLocation,
    selectLocation,
    setFilter,
    createPlan,
    addLocationToPlan,
    removeLocationFromPlan,
    reorderPlanLocations,
    selectPlan,
    sendReport,
    updatePlanNotes,
    generateShareCode,
    loadSharedPlan,
    exportToGoogleMaps,
    updateLocationRating,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};