import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

const Spreadsheet = forwardRef(({ onContextUpdate }, ref) => {
  // Initial data structure for Fortune Sheet
  const [workbookData, setWorkbookData] = useState([
    {
      name: "Sheet1",
      id: "sheet1",
      data: [] // Initial empty cells
    }
  ]);

  // Add effect to fix styling issues that can't be addressed through options
  useEffect(() => {
    const fixStylingGaps = () => {
      // Fix for bottom gap
      const bottomBar = document.querySelector('.fortune-sheet-container-bottom');
      if (bottomBar) {
        bottomBar.style.display = 'none';
      }
      
      // Fix for right gap
      const rightBar = document.querySelector('.fortune-sheet-container-right');
      if (rightBar) {
        rightBar.style.display = 'none';
      }
    };
    
    // Apply fixes after a short delay to ensure DOM is ready
    const timer = setTimeout(fixStylingGaps, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Get the current workbook data
    getWorkbookData: () => {
      console.log("Getting full workbook data:", workbookData);
      return workbookData;
    },
    
    // Function to update cells directly
    updateCells: (sheetId, row, values) => {
      console.log('Updating cells:', { sheetId, row, values });
      
      setWorkbookData(prevData => {
        const newData = [...prevData];
        const sheetIndex = newData.findIndex(sheet => sheet.id === sheetId);
        
        if (sheetIndex === -1) return prevData;
        
        const sheet = { ...newData[sheetIndex] };
        
        // Convert to data format that FortuneSheet uses
        if (!sheet.data) {
          sheet.data = [];
        }
        
        // Update each cell
        Object.entries(values).forEach(([col, value]) => {
          if (value === "none") return;
          
          const colIndex = parseInt(col, 10);
          
          // Find existing cell or create new one
          const existingCellIndex = sheet.data.findIndex(
            cell => cell.r === row && cell.c === colIndex
          );
          
          if (existingCellIndex >= 0) {
            // Update existing cell
            sheet.data[existingCellIndex] = {
              ...sheet.data[existingCellIndex],
              v: value
            };
          } else {
            // Add new cell
            sheet.data.push({
              r: row,
              c: colIndex,
              v: value
            });
          }
        });
        
        newData[sheetIndex] = sheet;
        return newData;
      });
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