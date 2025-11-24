import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import './App.css';

const SAVE_KEY = 'ffgg_state_v2';

function App() {
  const [score, setScore] = useState(0);
  const [energyDuration, setEnergyDuration] = useState(10); // Minutes
  const [resetTrigger, setResetTrigger] = useState(0);

  // Load score on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved && saved.score) {
      setScore(saved.score);
    }
  }, []);

  // Save score on change
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ score }));
  }, [score]);

  const handleReset = () => {
    setScore(0);
    setResetTrigger(prev => prev + 1);
    localStorage.removeItem(SAVE_KEY);
  };

  return (
    <div className="app-container">
      <HUD 
        score={score} 
        energyDuration={energyDuration} 
        setEnergyDuration={setEnergyDuration} 
        onReset={handleReset} 
      />
      <GameCanvas 
        score={score} 
        setScore={setScore} 
        energyDuration={energyDuration} 
        resetTrigger={resetTrigger}
      />
    </div>
  );
}

export default App;
