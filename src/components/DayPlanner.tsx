import React, { useState } from 'react';
import { MapPin, X, ArrowUp, ArrowDown, Share2, Map, Save, FileEdit } from 'lucide-react';
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
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  if (!activePlan) return null;

  const planLocations = activePlan.locations.map(id => 
    locations.find(loc => loc.id === id)
  ).filter(Boolean);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const handleSharePlan = () => {
    const shareCode = generateShareCode();
    const shareUrl = `${window.location.origin}?plan=${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("Link copied! Share this plan with a friend 🐶🍻");
  };

  const handleExportToMaps = () => {
    const mapsUrl = exportToGoogleMaps();
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
      showToast("Opening your pup-crawl route in Google Maps!");
    }
  };

  const handleSavePlan = () => {
    localStorage.setItem(`plan_${activePlan.id}`, JSON.stringify(activePlan));
    showToast("Your Dog Day Plan was saved to this device! 🐾");
  };

  const handleSaveNotes = () => {
    updatePlanNotes(notes);
    setShowNotes(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-40 animate-slideUp max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{activePlan.name}</h2>
          <p className="text-sm text-gray-500">{planLocations.length} stops</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNotes(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Add notes about your pup crawl"
          >
            <FileEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => selectPlan(null)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
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

      {/* Action buttons - sticky footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <button
            onClick={handleSavePlan}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm sm:text-base"
            title="Save your current plan so it's waiting for you later"
          >
            <Save className="w-4 h-4" />
            <span>💾 Save Plan to This Device</span>
          </button>
          
          <button
            onClick={handleSharePlan}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            title="Generate a link so someone else can view your pup adventure"
          >
            <Share2 className="w-4 h-4" />
            <span>🔗 Share Plan</span>
          </button>
          
          {planLocations.length > 1 && (
            <button
              onClick={handleExportToMaps}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              title="Tap to get walking or driving directions to your selected stops"
            >
              <Map className="w-4 h-4" />
              <span>📍 Open in Google Maps</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast message */}
      {toast.visible && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-center max-w-sm mx-auto z-50 animate-fadeIn">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DayPlanner;