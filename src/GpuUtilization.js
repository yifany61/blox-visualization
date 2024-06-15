import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import data from './data.json'; // Assuming your JSON data is stored in data.json

const processData = (data) => {
  const jobs = Object.entries(data).map(([job_id, job_info]) => ({
    job_id: job_id,
    current_round_time: job_info.current_round_time + 1, 
    num_allocated_gpus: job_info.num_allocated_gpus,
    job_arrival_time: job_info.job_arrival_time
  }));

  // group data by round time
  const roundData = jobs.reduce((acc, job) => {
    if (!acc[job.current_round_time]) {
      acc[job.current_round_time] = [];
    }
    acc[job.current_round_time].push({
      time: job.job_arrival_time,
      gpus: job.num_allocated_gpus
    });
    return acc;
  }, {});

  // Sort data within each round by time
  Object.keys(roundData).forEach(round => {
    roundData[round].sort((a, b) => a.time - b.time);
  });

  return roundData;
};

const GpuUtilizationOverTime = () => {
  const [chartData, setChartData] = useState({});
  const [visibleRounds, setVisibleRounds] = useState([]);

  useEffect(() => {
    const processedData = processData(data);
    setChartData(processedData);
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
        stroke={getColor(index)}
      />
    ));
  };

  const getColor = (index) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0', '#ffbb28'];
    return colors[index % colors.length];
  };

  return (
    <div>
      <div>
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
      <ResponsiveContainer width="100%" height={400}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GpuUtilizationOverTime;
