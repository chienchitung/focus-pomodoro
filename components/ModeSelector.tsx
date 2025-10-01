import React from 'react';
import { TimerMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ModeSelectorProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const { t } = useLanguage();
  const modes: { id: TimerMode; label: string }[] = [
    { id: 'pomodoro', label: t('pomodoro') },
    { id: 'shortBreak', label: t('shortBreak') },
    { id: 'longBreak', label: t('longBreak') },
  ];

  return (
    <div className="flex justify-center bg-black/10 p-1.5 rounded-full">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 w-1/3
            ${currentMode === mode.id ? 'bg-accent text-text-on-accent' : 'text-light/70 hover:bg-black/10'}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;