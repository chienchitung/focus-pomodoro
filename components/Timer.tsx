import React from 'react';
import { TimerMode } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ResetIcon } from './icons/ResetIcon';

interface TimerProps {
  mode: TimerMode;
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeRemaining, totalTime, isActive, onToggle, onReset }) => {
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * circumference : 0;
  const strokeDashoffset = circumference - progress;

  return (
    <div className="flex flex-col items-center justify-center my-8">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        <svg className="w-full h-full" viewBox="0 0 220 220">
          <circle
            className="text-black/20"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="110"
            cy="110"
          />
          <circle
            className="text-accent"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="110"
            cy="110"
            transform="rotate(-90 110 110)"
            style={{ transition: 'stroke-dashoffset 0.5s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl font-bold text-light tracking-tighter">
            {minutes}:{seconds}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-6 mt-8">
        <button 
            onClick={onReset}
            className="p-3 text-light/70 hover:text-light transition-colors rounded-full hover:bg-black/10"
            aria-label="Reset timer"
        >
            <ResetIcon />
        </button>
        <button 
            onClick={onToggle} 
            className="w-20 h-20 bg-accent text-text-on-accent rounded-full flex items-center justify-center text-lg font-bold uppercase tracking-wider transform hover:scale-105 transition-transform"
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
            {isActive ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="w-12 h-12"></div> {/* Spacer to balance reset button */}
      </div>
    </div>
  );
};

export default Timer;