import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

const Spreadsheet = forwardRef((props, ref) => {
  // Initial data structure for Fortune Sheet
  const [workbookData, setWorkbookData] = useState([
    {
      name: "Sheet1",
      celldata: [],
      id: "sheet1", // Fortune Sheet requires unique IDs
      order: 0,
      status: 1, // 1 means visible
      row: 30, // Default row count
      column: 10, // Default column count
      config: {},
    }
  ]);

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
      
      // Update the workbook with the converted data
      const newWorkbookData = [...workbookData];
      newWorkbookData[0].celldata = celldata;
      setWorkbookData(newWorkbookData);
    }
  }));

  // Event handlers for Fortune Sheet
  const handleWorkbookChange = (data) => {
    setWorkbookData(data);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Workbook 
        data={workbookData}
        onChange={handleWorkbookChange}
        style={{ height: '100%', width: '100%' }}
        options={{
          showToolbar: false, // Hide the default toolbar since we're using our custom one
          showFormulaBar: false, // Hide formula bar
          showSheetTabs: false, // Hide sheet tabs since we're handling sheets in our left menu
          row: 30,
          column: 10,
          columnHeaderHeight: 40, // Taller headers for better visibility
          rowHeaderWidth: 46, // Wider row headers
          cellContextMenu: true, // Enable right-click menu
        }}
      />
    </div>
  );
});

export default Spreadsheet; 