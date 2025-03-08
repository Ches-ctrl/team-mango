import React from 'react';
import { Button, Navbar, Dropdown, Tooltip } from 'flowbite-react';
import { FaPhone, FaPlus, FaCopy } from 'react-icons/fa';
import { FaClockRotateLeft } from "react-icons/fa6";
import { useRef } from 'react';
import * as XLSX from "xlsx";

const TopBar = ({ onPopulate, onShowHistory, onNewSheet, currentSheetId, setSpreadsheetData }) => {
  // Function to copy sheet ID to clipboard (kept for functionality but hidden from UI)
  const copySheetIdToClipboard = () => {
    if (currentSheetId) {
      navigator.clipboard.writeText(currentSheetId)
        .then(() => {
          alert('Sheet ID copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const fileInputRef = useRef(null);

  async function handleUploadSpreadsheet() {
    fileInputRef.current.click();
  }

  
  
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file);
      // Process the file (e.g., read with SheetJS)
      const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get first sheet name
      const sheetName = workbook.SheetNames[0];
      // Convert sheet to JSON
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      console.log("Extracted Data:", sheetData);
      setSpreadsheetData(sheetData); // Save to state
    };

    reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Navbar className="bg-white border-b border-gray-200 shadow-sm py-2.5 px-4" fluid>
      <div className="flex items-center justify-between w-full">
        <Navbar.Brand href="/">
          <img 
            src="/mango.png" 
            className="mr-2 h-8 w-8 object-contain" 
            alt="Mango Logo" 
          />
          <span className="self-center text-xl font-semibold text-gray-800">
            Mango
          </span>
        </Navbar.Brand>
        
        {/* Sheet ID display removed from here */}
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={onNewSheet}
            color="light"
            className="flex items-center justify-center"
          >
            <div className="flex items-center">
              <FaPlus className="w-4 h-4 mr-2" />
              <span>New Sheet</span>
            </div>
          </Button>
          
          <Button 
            onClick={onPopulate}
            color="success"
            className="flex items-center justify-center !bg-emerald-600 hover:!bg-emerald-700"
          >
            <div className="flex items-center">
              <FaPhone className="w-4 h-4 mr-2" />
              <span>Enrich</span>
            </div>
          </Button>
          
          <Button 
            onClick={onShowHistory}
            color="light"
            className="flex items-center justify-center"
          >
            <div className="flex items-center">
              <FaClockRotateLeft className="w-4 h-4 mr-2" />
              <span>History</span>
            </div>
          </Button>

          <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={handleUploadSpreadsheet}
        color="light"
        className="flex items-center justify-center"
      >
        <div className="flex items-center">
          <FaClockRotateLeft className="w-4 h-4 mr-2" />
          <span>upload spreadsheet</span>
        </div>
      </Button>
          
          <div className="ml-4">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                  <span className="sr-only">User menu</span>
                </div>
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">User Name</span>
                <span className="block truncate text-sm font-medium">user@example.com</span>
              </Dropdown.Header>
              <Dropdown.Item>Dashboard</Dropdown.Item>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Sign out</Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default TopBar; 