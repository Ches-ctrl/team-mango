import React, { useRef, useState, useEffect } from 'react';
import Spreadsheet from './components/Spreadsheet';
import TopBar from './components/TopBar';
import ContextDrawer from './components/ContextDrawer';
import { getSheet, getSheetHistory, updateSheet } from './services/sheetService';

function App() {
  const spreadsheetRef = useRef();
  const [contextText, setContextText] = useState("This spreadsheet contains contact information for various professionals.");
  const [sheetId, setSheetId] = useState("default-sheet");
  const [isLoading, setIsLoading] = useState(false);

  // Load context text from the backend when sheet ID changes
  useEffect(() => {
    const loadContextData = async () => {
      try {
        setIsLoading(true);
        const data = await getSheet(sheetId);
        if (data && data.context) {
          setContextText(data.context);
        }
      } catch (error) {
        console.error("Error loading context data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContextData();
  }, [sheetId]);

  // Transform raw Fortune Sheet data into a more structured format
  const transformSheetData = (rawData) => {
    // Get the first sheet
    const sheet = rawData[0];
    
    if (!sheet || !sheet.data || !Array.isArray(sheet.data) || sheet.data.length === 0) {
      return { headers: [], rows: {} };
    }
    
    // Extract headers from the first row, filtering out null values
    const headers = sheet.data[0]
      .filter(cell => cell !== null && cell.v !== null && cell.v !== undefined)
      .map(cell => cell.v);
    
    // Process the data rows (skip the header row)
    const rows = {};
    sheet.data.slice(1).forEach((row, rowIndex) => {
      // Skip rows that are entirely null
      const hasData = row.some(cell => cell !== null);
      if (!hasData) return;
      
      // Filter out null cells and create a row array
      const rowData = [];
      row.forEach((cell, cellIndex) => {
        if (cell !== null && cellIndex < headers.length) {
          rowData.push(cell.v);
        } else if (cellIndex < headers.length) {
          rowData.push(""); // Push empty string for null cells in header range
        }
      });
      
      // Only add rows that have at least one non-empty value
      if (rowData.some(value => value !== "")) {
        rows[rowIndex + 1] = rowData; // Use 1-based indexing for rows
      }
    });
    
    return { headers, rows };
  };

  const handlePopulate = () => {
    if (spreadsheetRef.current) {
      try {
        // Get the current sheet data using FortuneSheet API
        const rawSheetData = spreadsheetRef.current.getAllSheets();
        
        // Transform the data into the desired format
        const transformedData = transformSheetData(rawSheetData);
        
        // Create the payload object that would be sent to the API
        const payload = {
          context: contextText,
          sheet_data: transformedData
        };
        
        // Log the payload to the console
        console.log("API Payload:", JSON.stringify(payload, null, 2));
        
        // Alert for user feedback
        alert("Request payload has been logged to the console. In a real implementation, this would be sent to an AI service.");
        
        // Original dummy data population
        const dummyData = [
          [{ value: 'Name' }, { value: 'Email' }, { value: 'Phone' }, { value: 'Company' }, { value: 'Role' }],
          [{ value: 'John Doe' }, { value: 'john@example.com' }, { value: '555-1234' }, { value: 'Acme Inc' }, { value: 'Developer' }],
          [{ value: 'Jane Smith' }, { value: 'jane@example.com' }, { value: '555-5678' }, { value: 'XYZ Corp' }, { value: 'Designer' }],
          [{ value: 'Alex Brown' }, { value: 'alex@example.com' }, { value: '555-9012' }, { value: 'ABC Ltd' }, { value: 'Manager' }],
        ];
        
        // Still send the dummy data to the spreadsheet component for demonstration
        spreadsheetRef.current.updateData(dummyData);
      } catch (error) {
        console.error("Error in handlePopulate:", error);
        alert("An error occurred. Check the console for details.");
      }
    }
  };

  const handleContextUpdate = async (newContext) => {
    try {
      setContextText(newContext);
      
      // Update context in the backend
      if (spreadsheetRef.current) {
        const currentSheetId = spreadsheetRef.current.getSheetId();
        const currentData = spreadsheetRef.current.getAllSheets();
        await updateSheet(currentSheetId, currentData, newContext);
      }
    } catch (error) {
      console.error("Error updating context:", error);
    }
  };

  const handleShowHistory = async () => {
    try {
      if (spreadsheetRef.current) {
        const currentSheetId = spreadsheetRef.current.getSheetId();
        const history = await getSheetHistory(currentSheetId);
        console.log("Sheet history:", history);
        
        // Display history in a more user-friendly way
        if (history && history.length > 0) {
          const historyText = history.map((item, index) => 
            `Version ${item.version}: ${new Date(item.timestamp).toLocaleString()}`
          ).join('\n');
          
          alert(`Sheet History:\n${historyText}`);
        } else {
          alert("No history available for this sheet.");
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to load sheet history. Check console for details.");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      <TopBar 
        onPopulate={handlePopulate}
        onShowHistory={handleShowHistory}
      />
      <div className="flex-grow relative">
        <Spreadsheet 
          ref={spreadsheetRef} 
          contextText={contextText}
        />
      </div>
      <ContextDrawer 
        contextData={contextText} 
        onContextUpdate={handleContextUpdate} 
        isLoading={isLoading}
      />
    </div>
  );
}

export default App; 