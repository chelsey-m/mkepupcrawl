import React, { useState } from 'react';
import { X, ExternalLink, Flag, PawPrint, Plus } from 'lucide-react';
import { useLocations } from '../context/LocationContext';

interface PlaceDetailProps {
  onClose: () => void;
}

const PlaceDetail: React.FC<PlaceDetailProps> = ({ onClose }) => {
  const { selectedLocation, addLocationToPlan, activePlan, sendReport } = useLocations();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);

  if (!selectedLocation) return null;

  const { name, type, rating, yelpLink, notes, address } = selectedLocation;

  const handleAddToPlan = () => {
    if (activePlan && selectedLocation) {
      addLocationToPlan(selectedLocation.id);
      setAddedToPlan(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setAddedToPlan(false);
      }, 2000);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reportIssue.trim() && selectedLocation) {
      const success = await sendReport(
        selectedLocation.id,
        reportIssue.trim(),
        reportEmail.trim() || undefined
      );
      
      if (success) {
        setReportSent(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowReportForm(false);
          setReportSent(false);
          setReportIssue('');
          setReportEmail('');
        }, 3000);
      }
    }
  };

  // Helper function to render the paw rating
  const renderPawRating = () => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 4 }).map((_, index) => (
          <PawPrint 
            key={index}
            className={`w-5 h-5 ${index < rating ? 'text-amber-500' : 'text-gray-300'}`}
            fill={index < rating ? '#f59e0b' : 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden transform animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Type and Rating */}
          <div className="flex justify-between items-center mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {type === 'both' ? 'Indoor & Outdoor' : type}
            </span>
            {renderPawRating()}
          </div>
          
          {/* Address */}
          {address && (
            <div className="mb-3 text-gray-600">
              <p>{address}</p>
            </div>
          )}
          
          {/* Notes */}
          {notes && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-gray-700">{notes}</p>
            </div>
          )}
          
          {/* Yelp Link */}
          {yelpLink && (
            <a 
              href={yelpLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 mb-4"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Yelp</span>
            </a>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 mt-4">
            {activePlan && (
              <button
                onClick={handleAddToPlan}
                disabled={addedToPlan}
                className={`flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  addedToPlan
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {addedToPlan ? (
                  <>
                    <span>Added to {activePlan.name}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to {activePlan.name}</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
          
          {/* Report Form */}
          {showReportForm && (
            <div className="mt-4 border-t border-gray-200 pt-4 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Report an Issue
              </h3>
              
              {reportSent ? (
                <div className="p-3 bg-green-100 text-green-800 rounded-md">
                  Thank you for your report! We'll review it soon.
                </div>
              ) : (
                <form onSubmit={handleReport}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What's wrong with this listing?
                    </label>
                    <textarea
                      value={reportIssue}
                      onChange={(e) => setReportIssue(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="Please describe the issue..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your email (optional)
                    </label>
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="For follow-up if needed"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Send Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;