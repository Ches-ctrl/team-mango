import React from 'react';
import { Button, Navbar } from 'flowbite-react';
import { FaPhone, FaPlus } from 'react-icons/fa';
import { MdTableRows } from 'react-icons/md';

const TopBar = ({ onAddRow, onSetHeader, onPopulate }) => {
  return (
    <Navbar className="bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <Navbar.Brand href="/">
          <span className="self-center text-xl font-semibold text-gray-800">
            Spreadsheet App
          </span>
        </Navbar.Brand>
        
        <div className="flex gap-3">
          <Button 
            color="success" 
            onClick={onPopulate}
            className="font-medium flex items-center"
          >
            <span className="icon">
              <FaPhone className="h-5 w-5" />
            </span>
            <span className="ml-2">Populate with AI</span>
          </Button>
          
          <Button 
            color="light" 
            onClick={onAddRow}
            className="font-medium flex items-center"
          >
            <span className="icon">
              <FaPlus className="h-5 w-5" />
            </span>
            <span className="ml-2">Add Row</span>
          </Button>
          
          <Button 
            color="light" 
            onClick={onSetHeader}
            className="font-medium flex items-center"
          >
            <span className="icon">
              <MdTableRows className="h-5 w-5" />
            </span>
            <span className="ml-2">Set as Header</span>
          </Button>
        </div>
      </div>
    </Navbar>
  );
};

export default TopBar; 