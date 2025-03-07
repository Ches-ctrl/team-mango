import React, { useRef } from 'react';
import Spreadsheet from './components/Spreadsheet';
import TopBar from './components/TopBar';

function App() {
  const spreadsheetRef = useRef();

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

  const handleShowHistory = () => {
    alert("History functionality would show previous versions or changes");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <TopBar 
        onPopulate={handlePopulate}
        onShowHistory={handleShowHistory}
      />
      <Spreadsheet ref={spreadsheetRef} />
    </div>
  );
}

export default App; 