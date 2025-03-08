import React, { useState } from 'react';
import { Button, Navbar, Dropdown, Spinner } from 'flowbite-react';
import { FaPhone } from 'react-icons/fa';
import { FaClockRotateLeft } from "react-icons/fa6";

const TopBar = ({ onPopulate, onShowHistory, contextText }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnrichClick = async () => {
    setIsLoading(true);
    
    try {
      // Send the request to the ngrok URL
      const response = await fetch('https://e979-158-41-64-74.ngrok-free.app/bland/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "phone_number": "+447874943523",
          "task": contextText || "You are a friendly assistant calling to introduce yourself. Be polite and ask how their day is going. Keep the conversation brief and friendly.",
          "voice": "Josh",
          "wait_for_greeting": true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Call initiated:', data);
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('There was an error initiating the call. Please try again.');
    } finally {
      setIsLoading(false);
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
              <span>{isLoading ? 'Calling...' : 'Enrich'}</span>
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
  );
};

export default TopBar; 