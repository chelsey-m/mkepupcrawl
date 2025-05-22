import React, { useState, useEffect, useRef } from 'react';
import { useLocations } from '../context/LocationContext';
import { ChevronRight, ChevronLeft, PawPrint } from 'lucide-react';

const FilterOverlay: React.FC = () => {
  const { locations, selectLocation, selectedLocation, filter, setFilter } = useLocations();
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

  const handleRatingFilter = (rating: number) => {
    setFilter({
      ...filter,
      minRating: filter.minRating === rating ? undefined : rating
    });
  };

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

      <div className="w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg mb-3">Filters</h2>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex-1 p-2 rounded-md border transition-colors ${
                      filter.minRating === rating
                        ? 'bg-amber-100 border-amber-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-center">
                      {Array.from({ length: rating }).map((_, i) => (
                        <PawPrint
                          key={i}
                          className="w-4 h-4 text-amber-500"
                          fill="#f59e0b"
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-3">Breweries</h3>
          <div className="space-y-2">
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
      </div>
    </div>
  );
};

export default FilterOverlay;