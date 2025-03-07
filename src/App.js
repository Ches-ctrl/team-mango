import React, { useState, useRef } from 'react';
import Spreadsheet from './components/Spreadsheet';
import TopBar from './components/TopBar';
import LeftMenu from './components/LeftMenu';

function App() {
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [spreadsheets, setSpreadsheets] = useState([
    { id: 1, name: "Sheet 1 - " + new Date().toLocaleDateString() }
  ]);
  const [currentSpreadsheetId, setCurrentSpreadsheetId] = useState(1);
  const spreadsheetRef = useRef();

  const toggleMenu = () => {
    setMenuExpanded(!menuExpanded);
  };

  const createNewSpreadsheet = () => {
    const newId = spreadsheets.length + 1;
    const newSheet = {
      id: newId,
      name: `Sheet ${newId} - ${new Date().toLocaleDateString()}`
    };
    setSpreadsheets([...spreadsheets, newSheet]);
    setCurrentSpreadsheetId(newId);
  };

  const handleAddRow = () => {
    if (spreadsheetRef.current) {
      spreadsheetRef.current.addRow();
    }
  };

  const handleSetHeader = () => {
    if (spreadsheetRef.current) {
      spreadsheetRef.current.setAsHeader(0);
    }
  };

  const handlePopulate = () => {
    if (spreadsheetRef.current) {
      alert("In a real implementation, this would call an AI service to populate the spreadsheet with data.");
      
      // Simulated response - in a real app this would come from a fetch call
      const dummyData = [
        [{ value: 'Name' }, { value: 'Email' }, { value: 'Phone' }, { value: 'Company' }, { value: 'Role' }],
        [{ value: 'John Doe' }, { value: 'john@example.com' }, { value: '555-1234' }, { value: 'Acme Inc' }, { value: 'Developer' }],
        [{ value: 'Jane Smith' }, { value: 'jane@example.com' }, { value: '555-5678' }, { value: 'XYZ Corp' }, { value: 'Designer' }],
        [{ value: 'Alex Brown' }, { value: 'alex@example.com' }, { value: '555-9012' }, { value: 'ABC Ltd' }, { value: 'Manager' }],
      ];
      
      spreadsheetRef.current.populateData(dummyData);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <LeftMenu 
        expanded={menuExpanded} 
        toggleMenu={toggleMenu}
        spreadsheets={spreadsheets}
        currentId={currentSpreadsheetId}
        setCurrentSpreadsheet={setCurrentSpreadsheetId}
        createNewSpreadsheet={createNewSpreadsheet}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar 
          onAddRow={handleAddRow}
          onSetHeader={handleSetHeader}
          onPopulate={handlePopulate}
        />
        <Spreadsheet ref={spreadsheetRef} />
      </div>
    </div>
  );
}

export default App; 