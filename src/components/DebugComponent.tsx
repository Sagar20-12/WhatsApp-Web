import React from 'react';

const DebugComponent: React.FC = () => {
  console.log('DebugComponent rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      color: '#333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Debug Component</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ 
        backgroundColor: '#e0e0e0', 
        padding: '10px', 
        margin: '10px 0',
        borderRadius: '5px'
      }}>
        <h3>Environment Info:</h3>
        <p>Node Environment: {process.env.NODE_ENV}</p>
        <p>API URL: {process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}</p>
      </div>
    </div>
  );
};

export default DebugComponent;
