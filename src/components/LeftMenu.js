import React from 'react';
import { Button } from 'flowbite-react';
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiTable, HiPlus } from 'react-icons/hi';

const LeftMenu = ({ 
  expanded, 
  toggleMenu, 
  spreadsheets, 
  currentId, 
  setCurrentSpreadsheet, 
  createNewSpreadsheet 
}) => {
  return (
    <div className={`transition-all duration-300 h-full ${expanded ? 'w-64' : 'w-16'} bg-gray-50 border-r border-gray-200 relative`}>
      <div className="flex justify-end p-2 border-b border-gray-200">
        <Button 
          color="gray" 
          pill 
          size="sm" 
          onClick={toggleMenu}
        >
          {expanded ? <HiChevronDoubleLeft /> : <HiChevronDoubleRight />}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Spreadsheets</h3>
          <div className="space-y-1 mb-6">
            {spreadsheets.map(sheet => (
              <div 
                key={sheet.id} 
                className={`flex items-center p-2 rounded-lg cursor-pointer ${currentId === sheet.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                onClick={() => setCurrentSpreadsheet(sheet.id)}
              >
                <HiTable className="mr-2 h-5 w-5" />
                <span className="truncate">{sheet.name}</span>
                {currentId === sheet.id && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <Button
            gradientDuoTone="greenToBlue"
            className="w-full"
            onClick={createNewSpreadsheet}
          >
            <HiPlus className="mr-2 h-4 w-4" />
            New Spreadsheet
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeftMenu; 