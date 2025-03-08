import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

const Spreadsheet = forwardRef((props, ref) => {
  // Initial data structure for Fortune Sheet
  const [workbookData, setWorkbookData] = useState([
    {
      name: "Sheet1",
      data: [], // Using 'data' instead of 'celldata' to match Fortune Sheet's format
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

  // Add effect to fix styling issues that can't be addressed through options
  useEffect(() => {
    // Directly target and fix any elements causing gaps
    const fixStylingGaps = () => {
      // Target sheet tabs area which often causes gaps
      const sheetTabs = document.querySelectorAll('.luckysheet-sheet-area, .luckysheet-sheet-container');
      sheetTabs.forEach(el => {
        if (el) {
          el.style.margin = '0';
          el.style.padding = '0';
          el.style.height = 'auto';
          el.style.minHeight = '0';
          el.style.maxHeight = '30px'; // Limit the height
          el.style.border = 'none';
          el.style.boxSizing = 'border-box';
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
      console.log("Populating data:", dummyData);
      
      // Fortune Sheet uses a 2D array format for its data
      // Initialize 2D array with appropriate size
      const numRows = dummyData.length;
      const numCols = dummyData.reduce((max, row) => Math.max(max, row.length), 0);
      
      // Create empty 2D array
      const newData = Array(numRows).fill().map(() => Array(numCols).fill(null));
      
      // Fill the 2D array with data from dummyData
      dummyData.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell && cell.value !== undefined) {
            // Create cell with value
            newData[r][c] = {
              v: cell.value, // cell value
              m: cell.value, // display value
              ct: { t: "s", fa: "General" } // cell type: s=string
            };
          }
        });
      });
      
      console.log("Converted data:", newData);
      
      // Update the workbook with the converted data
      const newWorkbookData = [...workbookData];
      newWorkbookData[0].data = newData;
      setWorkbookData(newWorkbookData);
    },
    getColumnData: (columnIndex) => {
      // Get data from a specific column (0 = A, 1 = B, etc.)
      console.log("Getting data for column", columnIndex);
      console.log("Current workbook data:", workbookData);
      
      if (!workbookData || !workbookData[0]) {
        console.log("No workbook data found");
        return [];
      }
      
      // Extract the sheet data from the first worksheet
      const sheetData = workbookData[0].data || [];
      console.log("Sheet data:", sheetData);
      
      if (!sheetData || !Array.isArray(sheetData)) {
        console.log("No valid sheet data found");
        return [];
      }
      
      // Extract column data from the 2D array
      const columnData = [];
      
      for (let rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
        const row = sheetData[rowIndex];
        if (!row) continue;
        
        const cell = row[columnIndex];
        console.log(`Examining cell at row ${rowIndex}, column ${columnIndex}:`, cell);
        
        if (cell) {
          let value;
          
          // Handle different cell formats
          if (typeof cell === 'object' && cell !== null) {
            if ('v' in cell) {
              value = cell.v;
            } else if ('m' in cell) {
              value = cell.m;
            } else {
              value = JSON.stringify(cell);
            }
          } else {
            value = cell;
          }
          
          console.log(`Found value at row ${rowIndex}, column ${columnIndex}: ${value}`);
          
          columnData.push({
            rowIndex: rowIndex,
            value: value
          });
        }
      }
      
      console.log(`Extracted ${columnData.length} values from column ${columnIndex}:`, columnData);
      return columnData;
    },
    getWorkbookData: () => {
      // Return the full workbook data for direct access
      console.log("Getting full workbook data:", workbookData);
      return workbookData;
    }
  }));

  // Event handlers for Fortune Sheet
  const handleWorkbookChange = (data) => {
    setWorkbookData(data);
  };

  return (
    <div className="h-full w-full absolute inset-0 overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <Workbook 
        data={workbookData}
        onChange={handleWorkbookChange}
        style={{ 
          height: '100%', 
          width: '100%', 
          margin: 0, 
          padding: 0, 
          border: 'none',
          overflow: 'hidden'
        }}
        options={{
          showToolbar: true,  // Enable built-in toolbar for rich functionality
          showFormulaBar: true, 
          showSheetTabs: true,
          row: 100,
          column: 26,
          columnHeaderHeight: 40,
          rowHeaderWidth: 46,
          cellContextMenu: true,
          allowEdit: true,
          allowCopy: true,
          allowDelete: true,
          showinfobar: false,  // Hide infobar
          sheetFormulaBar: false, // Disable horizontal scrollbar
          enableAddRow: true, // Enable add row functionality
          enableAddBackTop: false, // Disable back to top button
          showSheetTabBottomBar: false, // Hide bottom bar to remove gaps
          sheetTabWidth: 120, // Control sheet tab width
        }}
      />
    </div>
  );
});

export default Spreadsheet; 