import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Flag, PawPrint, Plus, Minus, GripHorizontal, ChevronRight, HelpCircle } from 'lucide-react';
import { useLocations } from '../context/LocationContext';
import { PrivateNote, Location } from '../types';
import Draggable from 'react-draggable';

interface PlaceDetailProps {
  onClose: () => void;
}

const PRIVATE_NOTES_KEY = 'mkePupCrawl_privateNotes';

const PlaceDetail: React.FC<PlaceDetailProps> = ({ onClose }) => {
  const { selectedLocation, addLocationToPlan, activePlan, sendReport, updateLocationRating, updateLocationType } = useLocations();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);
  const [privateNote, setPrivateNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDragging, setIsDragging] = useState(false);
  const [showTypeTooltip, setShowTypeTooltip] = useState(false);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const savedNotes = localStorage.getItem(PRIVATE_NOTES_KEY);
      if (savedNotes) {
        const notes: PrivateNote[] = JSON.parse(savedNotes);
        const locationNote = notes.find(note => note.locationId === selectedLocation.id);
        if (locationNote) {
          setPrivateNote(locationNote.content);
        } else {
          setPrivateNote('');
        }
      }
    }
  }, [selectedLocation]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 50 && !isDragging) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const savePrivateNote = () => {
    if (!selectedLocation) return;

    const savedNotes = localStorage.getItem(PRIVATE_NOTES_KEY);
    let notes: PrivateNote[] = savedNotes ? JSON.parse(savedNotes) : [];
    
    const noteIndex = notes.findIndex(note => note.locationId === selectedLocation.id);
    const newNote: PrivateNote = {
      locationId: selectedLocation.id,
      content: privateNote,
      lastUpdated: new Date().toISOString()
    };

    if (noteIndex >= 0) {
      notes[noteIndex] = newNote;
    } else {
      notes.push(newNote);
    }

    localStorage.setItem(PRIVATE_NOTES_KEY, JSON.stringify(notes));
    setIsEditingNote(false);
  };

  if (!selectedLocation) return null;

  const { name, type, rating, yelpLink, notes, address } = selectedLocation;

  const handleAddToPlan = () => {
    if (activePlan && selectedLocation) {
      addLocationToPlan(selectedLocation.id);
      setAddedToPlan(true);
      
      setTimeout(() => {
        setAddedToPlan(false);
      }, 2000);
    }
  };

  const handleTypeChange = (newType: Location['type']) => {
    updateLocationType(selectedLocation.id, newType);
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
        setTimeout(() => {
          setShowReportForm(false);
          setReportSent(false);
          setReportIssue('');
          setReportEmail('');
        }, 3000);
      }
    }
  };

  const renderPawRating = () => (
    <div className="flex items-center gap-2">
      <div className="flex flex-shrink-0">
        {[1, 2, 3, 4].map((pawRating) => (
          <button
            key={pawRating}
            onClick={() => updateLocationRating(selectedLocation.id, pawRating)}
            className="group relative p-0.5"
            title={`Rate ${pawRating} paws`}
          >
            <PawPrint 
              className={`w-4 h-4 ${
                pawRating <= rating ? 'text-amber-500' : 'text-gray-300'
              } transition-colors hover:text-amber-400`}
              fill={pawRating <= rating ? '#f59e0b' : 'none'}
            />
          </button>
        ))}
      </div>
      <div className="relative flex-shrink-0">
        <button
          onMouseEnter={() => setShowRatingTooltip(true)}
          onMouseLeave={() => setShowRatingTooltip(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {showRatingTooltip && (
          <div className="absolute left-full ml-2 w-48 p-2 text-xs bg-gray-800 text-white rounded shadow-lg z-50">
            Rate your experience with your pup at this brewery
          </div>
        )}
      </div>
    </div>
  );

  const renderTypeSelector = () => (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 p-0.5 bg-gray-50">
        <button
          onClick={() => handleTypeChange('indoor')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            type === 'indoor' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Indoor Welcome
        </button>
        <button
          onClick={() => handleTypeChange('outdoor')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            type === 'outdoor' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Patio Only
        </button>
        <button
          onClick={() => handleTypeChange('both')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            type === 'both' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Pup-Friendly
        </button>
      </div>
      <div className="relative flex-shrink-0">
        <button
          onMouseEnter={() => setShowTypeTooltip(true)}
          onMouseLeave={() => setShowTypeTooltip(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {showTypeTooltip && (
          <div className="absolute left-full ml-2 w-48 p-2 text-xs bg-gray-800 text-white rounded shadow-lg z-50">
            Help keep information up to date by selecting where dogs are allowed
          </div>
        )}
      </div>
    </div>
  );

  const detailPanel = (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isMobile ? 'w-full max-w-md mx-auto' : 'w-72'
      } ${isMinimized ? 'h-12' : 'max-h-[80vh]'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div 
        className="flex items-center justify-between p-2 bg-amber-50 cursor-move"
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center space-x-2">
          <GripHorizontal className="w-4 h-4 text-amber-600" />
          <h2 className="font-medium text-sm text-amber-900 truncate">{name}</h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            {isMinimized ? (
              <Plus className="w-3 h-3 text-amber-600" />
            ) : (
              <Minus className="w-3 h-3 text-amber-600" />
            )}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-amber-600" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="overflow-y-auto max-h-[calc(80vh-3rem)]">
          <div className="p-3">
            <div className="flex flex-col gap-3">
              {renderTypeSelector()}
              {renderPawRating()}
            </div>
            
            {address && (
              <div className="mt-3 text-gray-600 text-sm">
                <p>{address}</p>
              </div>
            )}
            
            {notes && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">{notes}</p>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <div 
                className="relative"
                onClick={() => !isEditingNote && setIsExpanded(!isExpanded)}
              >
                <div className={`flex items-center justify-between p-2 bg-gray-50 rounded-md cursor-pointer ${
                  isExpanded ? 'rounded-b-none' : ''
                }`}>
                  <span className="text-xs font-medium text-gray-600">
                    {privateNote ? 'Your Notes' : 'Add Notes'}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </div>
                
                {isExpanded && (
                  <div className="p-2 bg-gray-50 rounded-b-md">
                    {isEditingNote ? (
                      <div>
                        <textarea
                          value={privateNote}
                          onChange={(e) => setPrivateNote(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                          rows={3}
                          placeholder="Add your personal notes..."
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setIsEditingNote(false)}
                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={savePrivateNote}
                            className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingNote(true);
                        }}
                        className="cursor-text"
                      >
                        {privateNote ? (
                          <p className="text-sm text-gray-700">{privateNote}</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Click to add notes...</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {yelpLink && (
                <a 
                  href={yelpLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View on Yelp</span>
                </a>
              )}
              
              {activePlan && (
                <button
                  onClick={handleAddToPlan}
                  disabled={addedToPlan}
                  className={`w-full flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    addedToPlan
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {addedToPlan ? (
                    <span>Added to plan!</span>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Add to plan</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setShowReportForm(true)}
                className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Flag className="w-3 h-3" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>

          {showReportForm && (
            <div className="p-3 border-t border-gray-200 animate-fadeIn">
              <h3 className="text-sm font-medium text-gray-800 mb-2">
                Report an Issue
              </h3>
              
              {reportSent ? (
                <div className="p-2 bg-green-100 text-green-800 rounded-md text-sm">
                  Thank you for your report! We'll review it soon.
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      What's wrong?
                    </label>
                    <textarea
                      value={reportIssue}
                      onChange={(e) => setReportIssue(e.target.value)}
                      required
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe the issue..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Your email (optional)
                    </label>
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="For follow-up"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Send Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-25"
      onClick={handleBackdropClick}
    >
      <div className="w-full h-full flex items-end sm:items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {isMobile ? (
            detailPanel
          ) : (
            <Draggable
              handle=".cursor-move"
              bounds="parent"
              position={position}
              onStart={() => setIsDragging(true)}
              onStop={(e, data) => {
                setPosition({ x: data.x, y: data.y });
                setIsDragging(false);
              }}
            >
              {detailPanel}
            </Draggable>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;