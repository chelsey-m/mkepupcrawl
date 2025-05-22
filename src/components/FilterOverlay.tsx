import React, { useState, useEffect, useRef } from 'react';
import { useLocations } from '../context/LocationContext';
import { ChevronDown, PawPrint, GripHorizontal, Loader, Beer } from 'lucide-react';
import Draggable from 'react-draggable';

const FilterOverlay: React.FC = () => {
  const { locations, selectLocation, selectedLocation, filter, setFilter } = useLocations();
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isMobile && isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isExpanded]);

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

  const paginatedLocations = locations.slice(0, page * itemsPerPage);
  const hasMore = locations.length > page * itemsPerPage;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage(prev => prev + 1);
    }
  };

  const filterPanel = (
    <div 
      ref={overlayRef}
      className={`transition-all duration-300 ${
        isMobile
          ? `fixed bottom-0 left-0 right-0 ${
              isExpanded 
                ? 'h-[70vh] translate-y-0' 
                : 'h-12 translate-y-full'
            }`
          : 'w-[300px]'
      }`}
    >
      <div 
        className={`bg-white/95 backdrop-blur-sm shadow-lg flex flex-col overflow-hidden ${
          isMobile ? 'h-full rounded-t-xl' : 'rounded-lg'
        }`}
      >
        <div 
          className="flex-shrink-0 p-3 border-b border-gray-200 cursor-move"
          onClick={() => isMobile && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isMobile ? (
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              ) : (
                <GripHorizontal className="w-4 h-4 text-gray-400" />
              )}
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

        <div 
          ref={listRef} 
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="p-2">
            <h3 className="text-xs font-semibold uppercase text-gray-500 px-2 mb-2">
              Breweries {locations.length > 0 && `(${locations.length})`}
            </h3>
            {locations.length === 0 ? (
              <div className="flex items-center justify-center p-4 text-gray-500">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                <span>Loading breweries...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {paginatedLocations.map(location => (
                  <button
                    key={location.id}
                    ref={selectedLocation?.id === location.id ? selectedRef : null}
                    onClick={() => {
                      selectLocation(location.id);
                      if (isMobile) setIsExpanded(false);
                    }}
                    className={`w-full text-left p-2 rounded-md transition-all ${
                      selectedLocation?.id === location.id
                        ? 'bg-amber-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Beer className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-sm">{location.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize flex items-center justify-between mt-1">
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
                {hasMore && (
                  <div className="p-4 text-center">
                    <Loader className="w-4 h-4 animate-spin inline-block" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${isMobile ? 'fixed inset-0 pointer-events-none' : 'absolute top-4 right-4'} z-[400]`}>
      {isMobile ? (
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsExpanded(true)}
            className={`fixed bottom-4 right-4 p-3 bg-amber-500 text-white rounded-full shadow-lg ${
              isExpanded ? 'hidden' : ''
            }`}
          >
            <Beer className="w-6 h-6" />
          </button>
          {filterPanel}
        </div>
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