import React, { useState, useEffect, useRef } from 'react';
import { useLocations } from '../context/LocationContext';
import { ChevronRight, ChevronLeft, PawPrint, GripHorizontal } from 'lucide-react';
import Draggable from 'react-draggable';

const FilterOverlay: React.FC = () => {
  const { locations, selectLocation, selectedLocation, filter, setFilter } = useLocations();
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setPosition({ x: 0, y: 0 }); // Reset position on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedLocation && selectedRef.current && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const elementRect = selectedRef.current.getBoundingClientRect();
      
      if (elementRect.top < listRect.top || elementRect.bottom > listRect.bottom) {
        selectedRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedLocation]);

  const handleRatingFilter = (rating: number) => {
    setFilter({
      ...filter,
      minRating: filter.minRating === rating ? undefined : rating
    });
  };

  const filterPanel = (
    <div className={`flex transition-transform duration-300 ${
      isExpanded ? 'translate-x-0' : 'translate-x-[calc(100%-2rem)]'
    }`}>
      <button
        onClick={toggleExpand}
        className="h-8 -ml-8 px-2 bg-white rounded-l-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label={isExpanded ? 'Collapse filter panel' : 'Expand filter panel'}
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="w-[300px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-3 border-b border-gray-200 cursor-move">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-gray-400" />
              <h2 className="font-medium text-base">Filters</h2>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Minimum Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex-1 p-1.5 rounded-md border transition-colors ${
                      filter.minRating === rating
                        ? 'bg-amber-100 border-amber-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-center">
                      {Array.from({ length: rating }).map((_, i) => (
                        <PawPrint
                          key={i}
                          className="w-3 h-3 text-amber-500"
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

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-2">
            <h3 className="text-xs font-semibold uppercase text-gray-500 px-2 mb-2">Breweries</h3>
            <div className="space-y-1">
              {locations.map(location => (
                <button
                  key={location.id}
                  ref={selectedLocation?.id === location.id ? selectedRef : null}
                  onClick={() => selectLocation(location.id)}
                  className={`w-full text-left p-2 rounded-md transition-all ${
                    selectedLocation?.id === location.id
                      ? 'bg-amber-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-gray-500 capitalize flex items-center justify-between">
                    <span>{location.type === 'both' ? 'Indoor & Outdoor' : location.type}</span>
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
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute top-4 right-4 z-[400]">
      {isMobile ? (
        filterPanel
      ) : (
        <Draggable
          handle=".cursor-move"
          bounds="parent"
          position={position}
          onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
        >
          {filterPanel}
        </Draggable>
      )}
    </div>
  );
};

export default FilterOverlay;