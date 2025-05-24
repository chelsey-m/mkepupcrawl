import React, { useState, useEffect, useRef } from 'react';
import { useLocations } from '../context/LocationContext';
import { ChevronDown, PawPrint, MapPin, Loader } from 'lucide-react';

const FilterOverlay: React.FC = () => {
  const { locations, selectLocation, selectedLocation, filter, setFilter } = useLocations();
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedLocation && selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
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

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-800 mb-3">Filter by Rating</h2>
        <div className="flex gap-1">
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
                    className="w-3 h-3 text-amber-500"
                    fill="#f59e0b"
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white">
        <h2 className="font-semibold text-gray-800 mb-3">
          Breweries on Map ({locations.length})
        </h2>
        <div 
          ref={listRef}
          className="space-y-2 overflow-y-auto"
          style={{ 
            maxHeight: isMobile ? '60vh' : 'calc(100vh - 16rem)',
            overscrollBehavior: 'contain'
          }}
          onScroll={handleScroll}
        >
          {paginatedLocations.map(location => (
            <button
              key={location.id}
              ref={selectedLocation?.id === location.id ? selectedRef : null}
              onClick={() => {
                selectLocation(location.id);
                if (isMobile) setIsExpanded(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedLocation?.id === location.id
                  ? 'bg-amber-100'
                  : 'bg-gray-50 hover:bg-gray-100'
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
          {hasMore && (
            <div className="p-4 text-center">
              <Loader className="w-4 h-4 animate-spin inline-block" />
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(true)}
          className={`fixed bottom-4 right-4 p-3 bg-amber-500 text-white rounded-full shadow-lg z-50 ${
            isExpanded ? 'hidden' : ''
          }`}
        >
          <MapPin className="w-6 h-6" />
        </button>

        {isExpanded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg animate-slideUp"
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Breweries</h2>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed top-[4.5rem] right-0 w-[300px] h-[calc(100vh-4.5rem)] bg-white shadow-lg z-40 overflow-hidden">
      {sidebarContent}
    </div>
  );
};

export default FilterOverlay;