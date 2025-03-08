import React, { useState, useEffect } from 'react';
import { Textarea, Label, Spinner } from 'flowbite-react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const ContextDrawer = ({ contextData, onContextUpdate, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextText, setContextText] = useState(
    typeof contextData === 'string' 
      ? contextData 
      : contextData.summary || 'Add spreadsheet context here...'
  );

  // Update local state when contextData prop changes
  useEffect(() => {
    if (typeof contextData === 'string') {
      setContextText(contextData);
    }
  }, [contextData]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleContextChange = (e) => {
    setContextText(e.target.value);
  };

  const handleSave = () => {
    if (onContextUpdate && typeof onContextUpdate === 'function') {
      onContextUpdate(contextText);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Drawer toggle button */}
      <div 
        className="flex justify-center items-center py-2 cursor-pointer hover:bg-gray-100"
        onClick={toggleDrawer}
      >
        <span className="mr-2 text-sm font-medium text-gray-700">
          {isOpen ? 'Hide Context' : 'Show Context'}
        </span>
        {isOpen ? <FaChevronDown /> : <FaChevronUp />}
      </div>
      
      {/* Drawer content */}
      {isOpen && (
        <div className="p-4 transition-all duration-300 ease-in-out">
          <div className="mb-2">
            <Label htmlFor="context" value="Spreadsheet Context" />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <Textarea
                id="context"
                value={contextText}
                onChange={handleContextChange}
                placeholder="Add context about this spreadsheet..."
                rows={3}
                className="mb-3"
              />
              
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save Context
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ContextDrawer; 