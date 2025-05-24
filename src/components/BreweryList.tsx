import React, { useState, useEffect } from 'react';
import { useLocations } from '../context/LocationContext';
import { MapPin, PawPrint, ChevronDown } from 'lucide-react';

const BreweryList: React.FC = () => {
  const { filteredLocations, selectLocation, selectedLocation } = useLocations();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const listContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            Breweries on Map ({filteredLocations.length})
          </h2>
          {isMobile && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronDown className={`w-5 h-5 text-gray-600 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLocations.map(location => (
            <button
              key={location.id}
              onClick={() => selectLocation(location.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedLocation?.id === location.id
                  ? 'bg-amber-100'
                  : 'hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-gray-900">{location.name}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">
                  {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
                </span>
                <div className="flex">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PawPrint
                      key={i}
                      className={`w-3 h-3 ${
                        i < location.rating ? 'text-amber-500' : 'text-gray-300'
                      }`}
                      fill={i < location.rating ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-30">
        {listContent}
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-[300px] h-screen bg-white shadow-lg z-30">
      <div className="h-full pt-[4.5rem]">
        {listContent}
      </div>
    </div>
  );
};

export default BreweryList;