import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Flag, PawPrint, Plus, Minus, GripHorizontal } from 'lucide-react';
import { useLocations } from '../context/LocationContext';
import { PrivateNote } from '../types';
import Draggable from 'react-draggable';

interface PlaceDetailProps {
  onClose: () => void;
}

const PRIVATE_NOTES_KEY = 'mkePupCrawl_privateNotes';

const PlaceDetail: React.FC<PlaceDetailProps> = ({ onClose }) => {
  const { selectedLocation, addLocationToPlan, activePlan, sendReport, updateLocationRating } = useLocations();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);
  const [privateNote, setPrivateNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setPosition({ x: 0, y: 0 }); // Reset position on resize
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

  const handleRatingUpdate = (newRating: number) => {
    updateLocationRating(selectedLocation.id, newRating);
  };

  const renderPawRating = () => (
    <div className="flex items-center">
      {Array.from({ length: 4 }).map((_, index) => (
        <button
          key={index}
          onClick={() => handleRatingUpdate(index + 1)}
          className="group relative"
          title={`Rate ${index + 1} paws`}
        >
          <PawPrint 
            className={`w-5 h-5 ${
              index < rating ? 'text-amber-500' : 'text-gray-300'
            } transition-colors hover:text-amber-400`}
            fill={index < rating ? '#f59e0b' : 'none'}
          />
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1} paws
          </span>
        </button>
      ))}
    </div>
  );

  const detailPanel = (
    <div 
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isMobile ? 'w-full max-w-md mx-auto' : 'w-96'
      } ${isMinimized ? 'h-12' : 'max-h-[80vh]'}`}
    >
      <div 
        className="flex items-center justify-between p-3 bg-amber-50 cursor-move"
        style={{ touchAction: 'none' }}
      >
        <div className="flex items-center space-x-2">
          <GripHorizontal className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-amber-900 truncate">{name}</h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            {isMinimized ? (
              <Plus className="w-4 h-4 text-amber-600" />
            ) : (
              <Minus className="w-4 h-4 text-amber-600" />
            )}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="overflow-y-auto max-h-[calc(80vh-3rem)]">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {type === 'both' ? 'Indoor & Outdoor' : type}
              </span>
              {renderPawRating()}
            </div>
            
            {address && (
              <div className="mb-3 text-gray-600">
                <p>{address}</p>
              </div>
            )}
            
            {notes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-gray-700">{notes}</p>
              </div>
            )}

            <div className="mb-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your private notes</h3>
              {isEditingNote ? (
                <div>
                  <textarea
                    value={privateNote}
                    onChange={(e) => setPrivateNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    rows={4}
                    placeholder="Add your personal notes about this location..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setIsEditingNote(false)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePrivateNote}
                      className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingNote(true)}
                  className="cursor-pointer group"
                >
                  {privateNote ? (
                    <p className="text-gray-700 p-2 rounded bg-gray-50 group-hover:bg-gray-100">
                      {privateNote}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic p-2 rounded bg-gray-50 group-hover:bg-gray-100">
                      Click to add your private notes...
                    </p>
                  )}
                </div>
              )}
            </div>
            
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
            
            <div className="flex flex-col space-y-2">
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
          </div>

          {showReportForm && (
            <div className="p-4 border-t border-gray-200 animate-fadeIn">
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
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="w-full h-full flex items-end sm:items-center justify-center">
        {isMobile ? (
          <div className="pointer-events-auto w-full max-w-md animate-slideUp">
            {detailPanel}
          </div>
        ) : (
          <Draggable
            handle=".cursor-move"
            bounds="parent"
            position={position}
            onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
          >
            <div className="pointer-events-auto">
              {detailPanel}
            </div>
          </Draggable>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;