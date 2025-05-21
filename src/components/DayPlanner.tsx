import React, { useState } from 'react';
import { MapPin, X, ArrowUp, ArrowDown, Share2, Map, Copy, FileEdit } from 'lucide-react';
import { useLocations } from '../context/LocationContext';

const DayPlanner: React.FC = () => {
  const { 
    activePlan, 
    locations, 
    removeLocationFromPlan, 
    reorderPlanLocations, 
    selectPlan,
    updatePlanNotes,
    generateShareCode,
    exportToGoogleMaps
  } = useLocations();

  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(activePlan?.notes || '');
  const [shareCodeCopied, setShareCodeCopied] = useState(false);

  if (!activePlan) return null;

  const planLocations = activePlan.locations.map(id => 
    locations.find(loc => loc.id === id)
  ).filter(Boolean);

  const handleSharePlan = () => {
    const shareCode = generateShareCode();
    const shareUrl = `${window.location.origin}?plan=${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCodeCopied(true);
    setTimeout(() => setShareCodeCopied(false), 2000);
  };

  const handleExportToMaps = () => {
    const mapsUrl = exportToGoogleMaps();
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleSaveNotes = () => {
    updatePlanNotes(notes);
    setShowNotes(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-40 animate-slideUp max-h-[60vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{activePlan.name}</h2>
          <p className="text-sm text-gray-500">{planLocations.length} stops</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNotes(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="Add Notes"
          >
            <FileEdit className="w-5 h-5" />
          </button>
          <button
            onClick={handleSharePlan}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="Share Plan"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {planLocations.length > 1 && (
            <button
              onClick={handleExportToMaps}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              title="Export to Google Maps"
            >
              <Map className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => selectPlan(null)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {showNotes ? (
          <div className="p-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Add notes about your pup crawl..."
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowNotes(false)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        ) : (
          <>
            {activePlan.notes && (
              <div className="p-4 bg-amber-50 border-b border-amber-100">
                <p className="text-amber-800 whitespace-pre-wrap">{activePlan.notes}</p>
              </div>
            )}
            
            {planLocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No locations added yet.</p>
                <p className="text-sm">Add locations from the map to start planning your day.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {planLocations.map((location, index) => (
                  location && (
                    <div 
                      key={location.id}
                      className="flex items-center p-3 hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{location.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {location.type === 'both' ? 'Indoor & Outdoor' : location.type}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <button
                            onClick={() => reorderPlanLocations(index, index - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        
                        {index < planLocations.length - 1 && (
                          <button
                            onClick={() => reorderPlanLocations(index, index + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => removeLocationFromPlan(location.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {shareCodeCopied && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-green-500 text-white px-4 py-2 rounded-t-lg animate-fadeIn">
          Share link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default DayPlanner;