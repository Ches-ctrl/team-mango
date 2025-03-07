import React, { useRef, useState } from 'react';
import Spreadsheet from './components/Spreadsheet';
import TopBar from './components/TopBar';
import ContextDrawer from './components/ContextDrawer';

function App() {
  const spreadsheetRef = useRef();
  const [contextText, setContextText] = useState("This spreadsheet contains contact information for various professionals.");

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

  const handleContextUpdate = (newContext) => {
    setContextText(newContext);
    // In a real app, you would also save this to a database or API
    console.log("Context updated:", newContext);
  };

  const handleShowHistory = () => {
    alert("History functionality would show previous versions or changes");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      <TopBar 
        onPopulate={handlePopulate}
        onShowHistory={handleShowHistory}
      />
      <div className="flex-1 relative">
        <Spreadsheet ref={spreadsheetRef} />
      </div>
      <ContextDrawer 
        contextData={contextText} 
        onContextUpdate={handleContextUpdate} 
      />
    </div>
  );
}

export default App; 