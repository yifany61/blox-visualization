import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import data from './data.json';

const processData = (data) => {
  const jobs = Object.entries(data).map(([job_id, job_info]) => ({
    job_id: job_id,
    current_round_time: job_info.current_round_time + 1,
    num_allocated_gpus: job_info.num_allocated_gpus,
    job_arrival_time: job_info.job_arrival_time
  }));

  // Group round time and calculate GPUs
  const roundData = jobs.reduce((acc, job) => {
    if (!acc[job.current_round_time]) {
      acc[job.current_round_time] = {};
    }
    if (!acc[job.current_round_time][job.job_arrival_time]) {
      acc[job.current_round_time][job.job_arrival_time] = 0;
    }
    acc[job.current_round_time][job.job_arrival_time] += job.num_allocated_gpus;
    return acc;
  }, {});

  // convert data to array
  const formattedData = Object.keys(roundData).reduce((acc, round) => {
    const roundArray = Object.entries(roundData[round]).map(([time, gpus]) => ({
      time: parseInt(time),
      gpus: gpus
    }));
    acc[round] = roundArray.sort((a, b) => a.time - b.time);
    return acc;
  }, {});

  return formattedData;
};

// random color
const generateColor = (index) => {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const GpuUtilization = () => {
  const [chartData, setChartData] = useState({});
  const [visibleRounds, setVisibleRounds] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("gpu_utilization");

  useEffect(() => {
    const processedData = processData(data);
    setChartData(processedData);
    setVisibleRounds(Object.keys(processedData)); 
  }, []);

  const rounds = Object.keys(chartData);

  const toggleRoundVisibility = (round) => {
    setVisibleRounds(prev => 
      prev.includes(round) ? prev.filter(r => r !== round) : [...prev, round]
    );
  };

  const renderLines = () => {
    return visibleRounds.map((round, index) => (
      <Line 
        key={round} 
        type="monotone" 
        dataKey="gpus" 
        data={chartData[round]} 
        name={`Round ${round}`} 
        stroke={generateColor(index)}
      />
    ));
  };

  // time intervals
  const generateTimeIntervals = () => {
    const allTimes = Object.values(chartData).flat().map(d => d.time);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const interval = Math.ceil((maxTime - minTime) / 10);
    const intervals = [];
    for (let i = minTime; i <= maxTime; i += interval) {
      intervals.push(i);
    }
    return intervals;
  };

  const timeIntervals = generateTimeIntervals();

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2>Select Metric</h2>
          <button 
            onClick={() => setSelectedMetric("gpu_utilization")}
            style={{ backgroundColor: selectedMetric === "gpu_utilization" ? 'lightgray' : 'white' }}
          >
            GPU Utilization
          </button>
          {/* Add more metric buttons as needed */}
        </div>
        <div>
          <h2>Select Round</h2>
          <button onClick={() => setVisibleRounds(rounds)}>Show All Rounds</button>
          {rounds.map(round => (
            <button 
              key={round} 
              onClick={() => toggleRoundVisibility(round)}
              style={{ backgroundColor: visibleRounds.includes(round) ? 'lightgray' : 'white' }}
            >
              Round {round}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            ticks={timeIntervals} 
          />
          <YAxis />
          <Legend />
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GpuUtilization;
