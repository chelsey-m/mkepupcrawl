import React, { useState } from 'react';
import { Filter, Beer } from 'lucide-react';
import { useLocations } from '../context/LocationContext';

const Header: React.FC = () => {
  const { filter, setFilter, plans, activePlan, selectPlan, createPlan } = useLocations();
  const [showFilters, setShowFilters] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const toggleFilters = () => {
    setShowFilters(!showFilters);
    if (showPlans) setShowPlans(false);
  };

  const togglePlans = () => {
    setShowPlans(!showPlans);
    if (showFilters) setShowFilters(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlanName.trim()) {
      createPlan(newPlanName.trim());
      setNewPlanName('');
    }
  };

  return (
    <header className="bg-white shadow-md">
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
            <Filter className="w-4 h-4" />
            <span>Filter</span>
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