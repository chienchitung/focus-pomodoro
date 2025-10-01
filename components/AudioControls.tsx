import React from 'react';
import { Settings } from '../types';
import { BACKGROUND_SOUNDS } from '../constants';
import { SoundOnIcon } from './icons/SoundOnIcon';
import { SoundOffIcon } from './icons/SoundOffIcon';

interface AudioControlsProps {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    bgAudioRef: React.RefObject<HTMLAudioElement>;
}

const AudioControls: React.FC<AudioControlsProps> = ({ settings, setSettings, bgAudioRef }) => {
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        // 只更新 state，讓 App.tsx 中的 useEffect 統一處理副作用
        setSettings(s => ({ ...s, backgroundVolume: newVolume }));
    };

    const isSoundOn = settings.backgroundSound !== 'none';

    return (
        <div className="flex items-center justify-center gap-4 mt-4 text-light/70">
           {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
            <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.backgroundVolume}
                onChange={handleVolumeChange}
                className="w-32 accent-accent"
                disabled={!isSoundOn}
                aria-label="Background sound volume"
            />
        </div>
    );
};

export default AudioControls;