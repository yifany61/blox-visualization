import React from 'react';
import './App.css';
import GpuUtilization from './GpuUtilization';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GPU Utilization Chart</h1>
        <GpuUtilization />
      </header>
    </div>
  );
}

export default App;
