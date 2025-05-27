import React from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import PlaceDetail from './components/PlaceDetail';
import DayPlanner from './components/DayPlanner';
import Toast from './components/Toast';
import { LocationProvider, useLocations } from './context/LocationContext';
import { breweries } from './data/breweries';

const AppContent: React.FC = () => {
  const { selectedLocation, selectLocation, addLocation, activePlan, toast, dismissToast } = useLocations();

  React.useEffect(() => {
    const addedBreweries = new Set();
    
    breweries.forEach(brewery => {
      const key = `${brewery.name}-${brewery.coordinates.join(',')}`;
      if (!addedBreweries.has(key)) {
        addedBreweries.add(key);
        addLocation({
          ...brewery,
          notes: `Dog-friendly ${brewery.type === 'both' ? 'indoor and outdoor' : 'outdoor only'} brewery.`
        });
      }
    });
  }, [addLocation]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="bg-amber-50 p-4 text-center">
          <h2 className="text-2xl font-semibold text-amber-800 font-display mb-2">
            Find your next pup-friendly pint! 🍺
          </h2>
        </div>
        <div className="h-[500px] relative">
          <MapView />
        </div>
        <div className="bg-amber-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start gap-6 bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-full md:w-48 flex-shrink-0">
                <div className="relative w-full pt-[100%] rounded-xl shadow-lg overflow-hidden">
                  <img 
                    src="/june.png" 
                    alt="June, our Chief Pup Officer 🐾" 
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-amber-800 mb-2">Meet June</h3>
                <p className="text-lg text-amber-700">
                  Our Chief Pup Officer 🐾
                </p>
                <p className="mt-2 text-amber-600">
                  Leading the way to Milwaukee's most dog-friendly breweries, one paw at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
        {selectedLocation && (
          <PlaceDetail onClose={() => selectLocation(null)} />
        )}
        {activePlan && <DayPlanner />}
        {toast && (
          <Toast 
            message={toast.message}
            action={toast.action}
            onDismiss={dismissToast}
          />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <LocationProvider>
      <AppContent />
    </LocationProvider>
  );
}

export default App;