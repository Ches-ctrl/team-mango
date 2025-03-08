import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { initSocket, closeSocket, emitSheetUpdate, getSheet, createSheet, updateSheet } from '../services/sheetService';

const Spreadsheet = forwardRef((props, ref) => {
  // Initial data structure for Fortune Sheet
  const [workbookData, setWorkbookData] = useState([
    {
      name: "Sheet1",
      celldata: [],
      id: "sheet1", // Fortune Sheet requires unique IDs
      order: 0,
      status: 1, // 1 means visible
      row: 100,  // More rows for a fuller sheet
      column: 26, // A to Z columns
      config: {
        rowHeight: 32,
      },
    }
  ]);
  
  const [sheetId, setSheetId] = useState("default-sheet");
  const [isLoading, setIsLoading] = useState(true);

  // Load data from backend when component mounts
  useEffect(() => {
    const loadSheetData = async () => {
      try {
        setIsLoading(true);
        const data = await getSheet(sheetId);
        if (data && data.data) {
          setWorkbookData(data.data);
        }
      } catch (error) {
        // If sheet doesn't exist, create a new one
        if (error.response && error.response.status === 404) {
          try {
            await createSheet(sheetId, workbookData);
          } catch (createError) {
            console.error("Error creating new sheet:", createError);
          }
        } else {
          console.error("Error loading sheet data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSheetData();
  }, [sheetId]);
  
  // Initialize socket connection for real-time updates
  useEffect(() => {
    const handleSheetUpdate = (data) => {
      if (data && data.sheetData) {
        setWorkbookData(data.sheetData);
      }
    };

    // Setup socket connection
    initSocket(sheetId, handleSheetUpdate);
    
    // Clean up socket on unmount
    return () => {
      closeSocket();
    };
  }, [sheetId]);

  // Add effect to fix styling issues that can't be addressed through options
  useEffect(() => {
    // Directly target and fix any elements causing gaps
    const fixStylingGaps = () => {
      // Hide the sheet tabs area completely
      const sheetTabs = document.querySelectorAll('.luckysheet-sheet-area, .luckysheet-sheet-container');
      sheetTabs.forEach(el => {
        if (el) {
          el.style.display = 'none';
        }
      });

      // Fix any scrollbars
      const scrollbars = document.querySelectorAll('.luckysheet-scrollbar');
      scrollbars.forEach(el => {
        if (el) el.style.display = 'none';
      });
    };

    // Run immediately and after a short delay to ensure it applies after render
    fixStylingGaps();
    const timer = setTimeout(fixStylingGaps, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Save workbook data to backend when it changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          // Update via Socket.io for real-time collaboration
          emitSheetUpdate(sheetId, workbookData, props.contextText || "");
          
          // Also update via REST API for persistence
          await updateSheet(sheetId, workbookData, props.contextText || "");
        } catch (error) {
          console.error("Error saving sheet data:", error);
        }
      };
      
      // Debounce saves to avoid excessive API calls
      const saveTimer = setTimeout(saveData, 1000);
      return () => clearTimeout(saveTimer);
    }
  }, [workbookData, isLoading, sheetId, props.contextText]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addRow: () => {
      // Fortune Sheet handles rows internally, but we could customize if needed
      console.log("Add row command received");
    },
    setAsHeader: (rowIndex) => {
      // Set formatting for header row
      const newData = [...workbookData];
      // This would need more implementation based on Fortune Sheet's API
      console.log("Set header command received for row", rowIndex);
      setWorkbookData(newData);
    },
    populateData: (dummyData) => {
      // Convert the react-spreadsheet data format to Fortune Sheet format
      const celldata = [];
      
      dummyData.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.value) {
            celldata.push({
              r, // row
              c, // column
              v: { // value object
                v: cell.value, // cell value
                m: cell.value, // display value (can be formatted)
                ct: { t: "s", fa: "General" }, // cell type: s=string
              }
            });
          }
        });
      });
      
      // Create a completely new workbook data object instead of modifying the existing one
      const newWorkbookData = workbookData.map(sheet => {
        return {
          ...sheet,
          celldata: [...celldata]
        };
      });
      
      setWorkbookData(newWorkbookData);
    },
    
    // Get all sheet data
    getAllSheets: () => {
      return JSON.parse(JSON.stringify(workbookData));
    },
    
    // Method to update data 
    updateData: (dummyData) => {
      const celldata = [];
      
      dummyData.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.value) {
            celldata.push({
              r, // row
              c, // column
              v: { // value object
                v: cell.value, // cell value
                m: cell.value, // display value (can be formatted)
                ct: { t: "s", fa: "General" }, // cell type: s=string
              }
            });
          }
        });
      });
      
      // Create a completely new workbook data object instead of modifying the existing one
      const newWorkbookData = workbookData.map(sheet => {
        return {
          ...sheet,
          celldata: [...celldata]
        };
      });
      
      setWorkbookData(newWorkbookData);
    },
    
    // Method to set the sheet ID
    setSheetId: (id) => {
      setSheetId(id);
    },
    
    // Get current sheet ID
    getSheetId: () => {
      return sheetId;
    }
  }));

  // Event handlers for Fortune Sheet
  const handleWorkbookChange = (data) => {
    // Ensure we only keep one sheet even if somehow another is added
    if (data.length > 1) {
      setWorkbookData([data[0]]);
    } else {
      setWorkbookData(data);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading spreadsheet...</div>
        </div>
      ) : (
        <Workbook 
          data={workbookData}
          onChange={handleWorkbookChange}
          style={{ height: '100%', width: '100%' }}
          options={{
            showToolbar: true,
            showFormulaBar: true, 
            showSheetTabs: false,
            row: 100,
            column: 26,
            columnHeaderHeight: 40,
            rowHeaderWidth: 46,
            cellContextMenu: true,
            allowEdit: true,
            allowCopy: true,
            allowDelete: true,
            showinfobar: false,
            sheetFormulaBar: false,
            enableAddRow: true,
            enableAddBackTop: false,
            showSheetTabBottomBar: false,
          }}
        />
      )}
    </div>
  );
});

export default Spreadsheet; 