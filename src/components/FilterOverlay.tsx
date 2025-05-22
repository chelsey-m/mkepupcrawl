import React, { useState, useEffect, useRef } from 'react';
import { useLocations } from '../context/LocationContext';
import { ChevronRight, ChevronLeft, PawPrint } from 'lucide-react';

const FilterOverlay: React.FC = () => {
  const { locations, selectLocation, selectedLocation } = useLocations();
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (selectedLocation && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedLocation]);

  return (
    <div 
      className={`absolute top-4 right-4 bottom-4 flex transition-transform duration-300 z-[400] ${
        isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-2rem)]'
      }`}
    >
      <button
        onClick={toggleExpand}
        className="h-8 -ml-8 px-2 bg-white rounded-l-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label={isExpanded ? 'Collapse filter panel' : 'Expand filter panel'}
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex">
        <div className={`flex-1 p-4 ${selectedLocation ? 'w-1/2' : 'w-full'}`}>
          <h2 className="font-semibold text-lg mb-4">Breweries</h2>
          <div className="space-y-2 h-[calc(100%-2rem)] overflow-y-auto">
            {locations.map(location => (
              <button
                key={location.id}
                ref={selectedLocation?.id === location.id ? selectedRef : null}
                onClick={() => selectLocation(location.id)}
                className={`w-full text-left p-3 rounded-lg transition-all transform ${
                  selectedLocation?.id === location.id
                    ? 'bg-amber-100 scale-102 shadow-sm'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
                </div>
                <div className="flex mt-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PawPrint
                      key={i}
                      className={`w-4 h-4 ${
                        i < location.rating ? 'text-amber-500' : 'text-gray-300'
                      }`}
                      fill={i < location.rating ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <div className="w-1/2 border-l border-gray-200 p-4 overflow-y-auto animate-fadeIn">
            <h3 className="font-semibold mb-2">{selectedLocation.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedLocation.address}</p>
            {selectedLocation.notes && (
              <div className="prose prose-sm">
                <p className="text-gray-700">{selectedLocation.notes}</p>
              </div>
            )}
            {selectedLocation.yelpLink && (
              <a
                href={selectedLocation.yelpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View on Yelp →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterOverlay;