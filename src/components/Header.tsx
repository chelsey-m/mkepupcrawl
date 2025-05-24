import React, { useState } from 'react';
import { SlidersHorizontal, Beer, List, MapPin, PawPrint, X } from 'lucide-react';
import { useLocations } from '../context/LocationContext';

const Header: React.FC = () => {
  const { filter, setFilter, plans, activePlan, selectPlan, createPlan, filteredLocations, selectLocation } = useLocations();
  const [showFilters, setShowFilters] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showBreweries, setShowBreweries] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (showPlans) setShowPlans(false);
    if (showBreweries) setShowBreweries(false);
  };

  const togglePlans = () => {
    setShowPlans(!showPlans);
    if (showFilters) setShowFilters(false);
    if (showBreweries) setShowBreweries(false);
  };

  const toggleBreweries = () => {
    setShowBreweries(!showBreweries);
    if (showFilters) setShowFilters(false);
    if (showPlans) setShowPlans(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlanName.trim()) {
      createPlan(newPlanName.trim());
      setNewPlanName('');
    }
  };

  const handleBrewerySelect = (locationId: string) => {
    selectLocation(locationId);
    setShowBreweries(false);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowBreweries(false);
    }
  };

  // Sort breweries alphabetically by name
  const sortedBreweries = [...filteredLocations].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <header className="bg-white shadow-md relative z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <Beer className="w-8 h-8 text-amber-600" />
          <h1 className="text-xl font-bold text-gray-800">MKE Pup Crawl</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleFilters}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${
              showFilters ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>

          <button 
            onClick={toggleBreweries}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm ${
              showBreweries ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            <List className="w-4 h-4" />
            <span>Browse Breweries</span>
          </button>
          
          <button 
            onClick={togglePlans}
            className={`px-3 py-1.5 rounded-full text-sm ${
              activePlan ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'  
            } ${showPlans ? 'bg-amber-500 text-white' : ''} transition-colors`}
          >
            {activePlan ? activePlan.name : 'Pub Crawl Plans'}
          </button>
        </div>
      </div>
      
      {/* Filters dropdown */}
      {showFilters && (
        <div className="border-t border-gray-200 p-3 bg-white shadow-lg animate-fadeDown">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter({ type: 'all' })}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter.type === 'all' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🐾 All Pup-Friendly Bars
            </button>
            <button
              onClick={() => setFilter({ type: 'indoor' })}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter.type === 'indoor' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Indoor Welcome
            </button>
            <button
              onClick={() => setFilter({ type: 'outdoor' })}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter.type === 'outdoor' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Patio Only
            </button>
          </div>
        </div>
      )}

      {/* Breweries dropdown */}
      {showBreweries && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={handleClickOutside}
        >
          <div className={`absolute right-4 mt-2 w-80 max-h-[50vh] bg-white rounded-lg shadow-xl overflow-hidden sm:right-[6.5rem] ${
            showBreweries ? 'animate-fadeDown' : ''
          }`}>
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-700">Breweries on Map ({sortedBreweries.length})</h3>
              <button
                onClick={() => setShowBreweries(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(50vh - 3rem)' }}>
              {sortedBreweries.map(brewery => (
                <button
                  key={brewery.id}
                  onClick={() => handleBrewerySelect(brewery.id)}
                  className="w-full text-left p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{brewery.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between pl-6">
                    <span className="text-xs text-gray-600 capitalize">
                      {brewery.type === 'both' ? 'Indoor & Outdoor' : brewery.type}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <PawPrint
                          key={i}
                          className={`w-3 h-3 ${
                            i < brewery.rating ? 'text-amber-500' : 'text-gray-300'
                          }`}
                          fill={i < brewery.rating ? '#f59e0b' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Plans dropdown */}
      {showPlans && (
        <div className="border-t border-gray-200 p-3 bg-white shadow-lg animate-fadeDown">
          <form onSubmit={handleCreatePlan} className="mb-3 flex">
            <input
              type="text"
              placeholder="Name your pup crawl..."
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-r-md hover:bg-amber-600"
            >
              Create
            </button>
          </form>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {plans.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No pup crawls planned yet. Create one to get started!</p>
            ) : (
              plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan.id)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    activePlan?.id === plan.id 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs opacity-80">
                    {new Date(plan.createdAt).toLocaleDateString()} • 
                    {plan.locations.length} stops
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;