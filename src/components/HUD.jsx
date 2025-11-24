import React from 'react';
import './HUD.css';

const HUD = ({ score, energyDuration, setEnergyDuration, onReset }) => {
    return (
        <div className="hud-container">
            <div className="hud-panel left">
                <label className="energy-control">
                    <span>Magic: {energyDuration}m</span>
                    <input
                        type="range"
                        min="1"
                        max="60"
                        value={energyDuration}
                        onChange={(e) => setEnergyDuration(parseInt(e.target.value, 10))}
                        className="magic-slider"
                    />
                </label>
            </div>

            <div className="hud-panel center">
                <div className="score-display">
                    <span className="gem-icon">💎</span>
                    <span className="score-value">{score}</span>
                </div>
            </div>

            <div className="hud-panel right">
                <button className="reset-btn" onClick={onReset} title="Start Over">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default HUD;
