import React, { useState, useEffect } from 'react';
import { Textarea, Label } from 'flowbite-react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

const ContextDrawer = ({ contextData, onContextUpdate }) => {
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
    const newValue = e.target.value;
    setContextText(newValue);
    // Auto-save the changes
    if (onContextUpdate) {
      onContextUpdate(newValue);
    }
  };

  return (
    <>
      {/* Toggle button when drawer is closed */}
      {!isOpen && (
        <div 
          className="context-drawer-toggle bg-white border-t border-x border-gray-200 rounded-t-lg shadow-md w-64"
          style={{ 
            zIndex: 999, 
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 0
          }}
        >
          <button 
            onClick={toggleDrawer}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none w-full justify-center"
            aria-label="Open context drawer"
          >
            <span className="text-sm font-medium">Spreadsheet Context</span>
            <FaChevronUp className="text-emerald-600" />
          </button>
        </div>
      )}
      
      {/* Drawer content with toggle button at top when open */}
      {isOpen && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg context-drawer-content"
          style={{ zIndex: 1000 }}
        >
          {/* Toggle button at top of drawer */}
          <div className="border-b border-gray-200 py-2">
            <button 
              onClick={toggleDrawer}
              className="flex items-center gap-2 px-4 py-1 text-gray-600 hover:text-gray-800 focus:outline-none mx-auto"
              aria-label="Close context drawer"
            >
              <span className="text-sm font-medium">Spreadsheet Context</span>
              <FaChevronDown className="text-emerald-600" />
            </button>
          </div>
          
          <div className="px-6 py-5 max-w-4xl mx-auto">
            <div className="mb-3">
              <Label htmlFor="spreadsheetContext" value="Context Notes" className="text-base" />
            </div>
            <div className="py-2">
              <Textarea
                id="spreadsheetContext"
                placeholder="Add notes, context, or any relevant information about this spreadsheet..."
                value={contextText}
                onChange={handleContextChange}
                rows={4}
                className="w-full focus:border-emerald-500 focus:ring-emerald-500 text-base"
                style={{ padding: '12px' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContextDrawer; 