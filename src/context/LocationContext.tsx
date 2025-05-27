import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Location, Plan, Filter, Toast } from '../types';
import { breweries } from '../data/breweries';

interface LocationContextType {
  locations: Location[];
  filteredLocations: Location[];
  selectedLocation: Location | null;
  filter: Filter;
  plans: Plan[];
  activePlan: Plan | null;
  isLoading: boolean;
  toast: Toast | null;
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
  updateLocationType: (locationId: string, type: Location['type']) => void;
  resetFilters: () => void;
  dismissToast: () => void;
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
const TYPES_KEY = 'mkePupCrawl_types';
const FILTERS_KEY = 'mkePupCrawl_filters';
const NOTES_KEY = 'mkePupCrawl_notes';

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filter, setFilter] = useState<Filter>(() => {
    const savedFilters = localStorage.getItem(FILTERS_KEY);
    return savedFilters ? JSON.parse(savedFilters) : { type: 'all', minRating: 0 };
  });
  const [plans, setPlans] = useState<Plan[]>(() => {
    const savedPlans = localStorage.getItem(STORAGE_KEY);
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const initializeLocations = async () => {
      setIsLoading(true);
      try {
        // Log the raw breweries data
        console.log('Raw breweries data:', breweries);
        
        const uniqueBreweries = new Map();
        
        breweries.forEach(brewery => {
          const key = `${brewery.name}-${brewery.coordinates.join(',')}`;
          if (!uniqueBreweries.has(key)) {
            const location: Location = {
              ...brewery,
              id: nanoid()
            };
            
            // Log each location as it's being processed
            console.log('Processing location:', {
              name: location.name,
              coordinates: location.coordinates,
              address: location.address
            });
            
            uniqueBreweries.set(key, location);
          }
        });

        const initialLocations = Array.from(uniqueBreweries.values());

        // Load saved data
        const savedRatings = localStorage.getItem(RATINGS_KEY);
        const savedTypes = localStorage.getItem(TYPES_KEY);
        const savedNotes = localStorage.getItem(NOTES_KEY);

        if (savedRatings) {
          const customRatings = JSON.parse(savedRatings);
          initialLocations.forEach(location => {
            if (customRatings[location.id]) {
              location.rating = customRatings[location.id];
            }
          });
        }

        if (savedTypes) {
          const customTypes = JSON.parse(savedTypes);
          initialLocations.forEach(location => {
            if (customTypes[location.id]) {
              location.type = customTypes[location.id];
            }
          });
        }

        if (savedNotes) {
          const customNotes = JSON.parse(savedNotes);
          initialLocations.forEach(location => {
            if (customNotes[location.id]) {
              location.notes = customNotes[location.id];
            }
          });
        }

        // Log final processed locations
        console.log('Final processed locations:', initialLocations.map(loc => ({
          name: loc.name,
          coordinates: loc.coordinates,
          address: loc.address
        })));

        setLocations(initialLocations);
      } catch (error) {
        console.error('Error initializing locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocations();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filter));
  }, [filter]);

  const showToast = useCallback((message: string, action?: () => void) => {
    setToast({ message, action });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilter({ type: 'all', minRating: 0 });
    showToast('Filters have been reset');
  }, [showToast]);

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation = {
      ...location,
      id: nanoid(),
    };
    
    const exists = locations.some(loc => 
      loc.name === newLocation.name && 
      loc.coordinates[0] === newLocation.coordinates[0] && 
      loc.coordinates[1] === newLocation.coordinates[1]
    );
    
    if (!exists) {
      setLocations(prev => [...prev, newLocation]);
    }
  };

  const filteredLocations = locations.filter(location => {
    if (filter.type === 'indoor') {
      if (location.type !== 'indoor' && location.type !== 'both') {
        return false;
      }
    } else if (filter.type === 'outdoor') {
      if (location.type !== 'outdoor' && location.type !== 'both') {
        return false;
      }
    }
    
    if (filter.minRating && location.rating < filter.minRating) {
      return false;
    }
    
    return true;
  });

  const updateLocationType = (locationId: string, type: Location['type']) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    const willBeFiltered = 
      (filter.type === 'indoor' && type !== 'indoor' && type !== 'both') ||
      (filter.type === 'outdoor' && type !== 'outdoor' && type !== 'both');

    setLocations(prevLocations =>
      prevLocations.map(loc =>
        loc.id === locationId ? { ...loc, type } : loc
      )
    );

    if (selectedLocation?.id === locationId) {
      setSelectedLocation(prev => prev ? { ...prev, type } : null);
    }

    const savedTypes = localStorage.getItem(TYPES_KEY);
    const types = savedTypes ? JSON.parse(savedTypes) : {};
    types[locationId] = type;
    localStorage.setItem(TYPES_KEY, JSON.stringify(types));

    if (willBeFiltered) {
      showToast(
        'This brewery no longer matches your filters and will be hidden.',
        resetFilters
      );
    }
  };

  const updateLocationRating = (locationId: string, rating: number) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    const willBeFiltered = filter.minRating && rating < filter.minRating;

    setLocations(prevLocations =>
      prevLocations.map(loc =>
        loc.id === locationId ? { ...loc, rating } : loc
      )
    );

    if (selectedLocation?.id === locationId) {
      setSelectedLocation(prev => prev ? { ...prev, rating } : null);
    }

    const savedRatings = localStorage.getItem(RATINGS_KEY);
    const ratings = savedRatings ? JSON.parse(savedRatings) : {};
    ratings[locationId] = rating;
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));

    if (willBeFiltered) {
      showToast(
        'This brewery no longer matches your rating filter and will be hidden.',
        resetFilters
      );
    }
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
    toast,
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
    updateLocationType,
    resetFilters,
    dismissToast
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};