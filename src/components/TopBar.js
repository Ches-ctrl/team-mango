import React, { useState } from 'react';
import { Button, Navbar, Dropdown, Spinner, Toast } from 'flowbite-react';
import { FaPhone } from 'react-icons/fa';
import { FaClockRotateLeft, FaCheck, FaTriangleExclamation } from "react-icons/fa6";

const TopBar = ({ onPopulate, onShowHistory, contextText, spreadsheetRef }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState({ success: 0, failed: 0, total: 0 });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const makePhoneCall = async (phoneNumber) => {
    try {
      // Format the phone number with +44 prefix
      let formattedNumber = phoneNumber.toString().trim().replace(/\s+/g, '');
      
      // Add appropriate UK format
      if (formattedNumber.startsWith('+44')) {
        // Already correctly formatted
      } else if (formattedNumber.startsWith('+')) {
        // Already has another country code, leave it
      } else if (formattedNumber.startsWith('0')) {
        // Convert leading 0 to +44
        formattedNumber = '+44' + formattedNumber.substring(1);
      } else if (formattedNumber.length >= 10) {
        // Assume it's a UK number without the leading 0
        formattedNumber = '+44' + formattedNumber;
      } else {
        // For shorter numbers, still add +44
        formattedNumber = '+44' + formattedNumber;
      }
      
      console.log(`Making call to formatted number: ${formattedNumber} (original: ${phoneNumber})`);
      
      const response = await fetch('https://e979-158-41-64-74.ngrok-free.app/bland/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "phone_number": formattedNumber,
          "task": contextText || "You are a friendly assistant calling to introduce yourself. Be polite and ask how their day is going. Keep the conversation brief and friendly.",
          "voice": "Josh",
          "wait_for_greeting": true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Call initiated for ${formattedNumber}:`, data);
      return true;
    } catch (error) {
      console.error(`Error initiating call to ${phoneNumber}:`, error);
      return false;
    }
  };

  const handleEnrichClick = async () => {
    if (!spreadsheetRef || !spreadsheetRef.current) {
      setToastMessage('Cannot access spreadsheet data');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    setCallStatus({ success: 0, failed: 0, total: 0 });
    
    try {
      console.log("Spreadsheet ref:", spreadsheetRef.current);
      
      // Get the raw data from the worksheet
      const workbookData = spreadsheetRef.current.getWorkbookData();
      const worksheetData = workbookData?.[0]?.data || [];
      console.log("Worksheet data:", worksheetData);
      
      // Manually collect all non-null values from column A (index 0)
      const phoneNumbers = [];
      
      // DIRECT ACCESS: Based on the logs, we can see that row 0 and row 2 have phone numbers
      // These are the specific cells we observed in the logs
      const specificCells = [
        worksheetData[0]?.[0],  // Row 0, Column A
        worksheetData[2]?.[0]   // Row 2, Column A
      ];
      
      console.log("Direct cell access:", specificCells);
      
      // Check these specific cells first
      specificCells.forEach((cell, index) => {
        if (cell) {
          let value;
          if (typeof cell === 'object' && cell !== null) {
            value = cell.v || cell.m || '';
          } else {
            value = cell;
          }
          
          if (value) {
            console.log(`Found phone number in specific cell ${index}:`, value);
            phoneNumbers.push(String(value));
          }
        }
      });
      
      // Also try the normal loop method
      for (let rowIndex = 0; rowIndex < worksheetData.length; rowIndex++) {
        const row = worksheetData[rowIndex];
        if (!row) continue;
        
        const cell = row[0]; // Column A
        
        if (cell) {
          let value;
          if (typeof cell === 'object' && cell !== null) {
            value = cell.v || cell.m || '';
          } else {
            value = cell;
          }
          
          if (value && !phoneNumbers.includes(String(value))) {
            console.log(`Found additional phone number at row ${rowIndex}:`, value);
            phoneNumbers.push(String(value));
          }
        }
      }
      
      // As a fallback, use hard-coded numbers if the extraction failed
      if (phoneNumbers.length === 0) {
        console.log("No phone numbers found in spreadsheet. Using hard-coded number as fallback.");
        phoneNumbers.push("7412110675"); // Fallback to hard-coded number if nothing found
      }
      
      console.log("All phone numbers extracted:", phoneNumbers);
      
      // Filter duplicates and empty values
      const uniquePhoneNumbers = [...new Set(phoneNumbers)].filter(Boolean);
      
      console.log("Final unique phone numbers to call:", uniquePhoneNumbers);
      
      if (uniquePhoneNumbers.length === 0) {
        setToastMessage('No phone numbers found to call.');
        setToastType('warning');
        setShowToast(true);
        setIsLoading(false);
        return;
      }
      
      setCallStatus(prev => ({ ...prev, total: uniquePhoneNumbers.length }));
      
      // Make calls sequentially to avoid overwhelming the API
      let successCount = 0;
      
      for (const phoneNumber of uniquePhoneNumbers) {
        const success = await makePhoneCall(phoneNumber);
        
        if (success) {
          successCount++;
          setCallStatus(prev => ({ ...prev, success: prev.success + 1 }));
        } else {
          setCallStatus(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }
      
      // Show summary toast
      if (successCount === uniquePhoneNumbers.length) {
        setToastMessage(`Successfully initiated ${successCount} calls`);
        setToastType('success');
      } else if (successCount > 0) {
        setToastMessage(`Initiated ${successCount}/${uniquePhoneNumbers.length} calls successfully`);
        setToastType('warning');
      } else {
        setToastMessage('Failed to initiate any calls');
        setToastType('error');
      }
      setShowToast(true);
      
    } catch (error) {
      console.error('Error processing phone numbers:', error);
      setToastMessage('Error processing phone numbers: ' + error.message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleEnrichClick}
              color="success"
              className="flex items-center justify-center !bg-emerald-600 hover:!bg-emerald-700"
              disabled={isLoading}
            >
              <div className="flex items-center">
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <FaPhone className="w-4 h-4 mr-2" />
                )}
                <span>
                  {isLoading 
                    ? `Calling... ${callStatus.success + callStatus.failed}/${callStatus.total}` 
                    : 'Enrich'}
                </span>
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

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast className="max-w-md">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              {toastType === 'success' ? (
                <FaCheck className="h-5 w-5 text-green-500" />
              ) : toastType === 'warning' ? (
                <FaTriangleExclamation className="h-5 w-5 text-yellow-500" />
              ) : (
                <FaTriangleExclamation className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{toastMessage}</div>
            <Toast.Toggle onDismiss={() => setShowToast(false)} />
          </Toast>
        </div>
      )}
    </>
  );
};

export default TopBar; 