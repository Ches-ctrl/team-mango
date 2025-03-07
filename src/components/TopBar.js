import React from 'react';
import { Button } from 'flowbite-react';
import { FaPhone } from 'react-icons/fa';
import { FaClockRotateLeft } from "react-icons/fa6";

const TopBar = ({ onPopulate, onShowHistory }) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full flex items-center justify-between px-4 py-2.5">
        <div className="flex-shrink-0">
          <span className="self-center text-xl font-semibold text-gray-800">
            AI Spreadsheet
          </span>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="font-medium flex items-center bg-emerald-700 hover:bg-emerald-800"
            onClick={onPopulate}
          >
            <span className="icon">
              <FaPhone className="h-5 w-5" />
            </span>
            <span className="ml-2">Populate with AI</span>
          </Button>
          
          <Button 
            color="light" 
            onClick={onShowHistory}
            className="font-medium flex items-center"
          >
            <span className="icon">
              <FaClockRotateLeft className="h-5 w-5" />
            </span>
            <span className="ml-2">History</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 