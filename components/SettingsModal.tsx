import React, { useState } from 'react';
import { Settings } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { ALARM_SOUNDS, BACKGROUND_SOUNDS } from '../constants';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SettingsModalProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  onClose: () => void;
}

const SettingsInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }> = ({ label, value, onChange, min = 1, max = 120 }) => (
    <div className="flex justify-between items-center">
        <label className="text-light/80">{label}</label>
        <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} min={min} max={max} className="w-20 bg-primary border-none rounded-md p-2 text-center focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
);

const SettingsSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: {id: string, name: string}[] }> = ({ label, value, onChange, options }) => (
    <div className="flex justify-between items-center">
        <label className="text-light/80">{label}</label>
        <div className="relative">
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-40 bg-primary border-none rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent appearance-none">
                {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-light/50"><ChevronDownIcon /></div>
        </div>
    </div>
);

const SettingsSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> = ({ label, value, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-light/80">{label}</label>
        <input type="range" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} min="0" max="1" step="0.05" className="w-40" />
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const { t } = useLanguage();
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const handleSave = () => {
    onSave(currentSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t('settings')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10" aria-label={t('closeSettings')}><CloseIcon /></button>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <h3 className="text-sm font-semibold uppercase text-light/50 tracking-wider mb-3">{t('timerDurations')}</h3>
                <div className="space-y-3">
                    <SettingsInput label={t('pomodoro')} value={currentSettings.pomodoro} onChange={(val) => setCurrentSettings(s => ({ ...s, pomodoro: val }))} />
                    <SettingsInput label={t('shortBreak')} value={currentSettings.shortBreak} onChange={(val) => setCurrentSettings(s => ({ ...s, shortBreak: val }))} />
                    <SettingsInput label={t('longBreak')} value={currentSettings.longBreak} onChange={(val) => setCurrentSettings(s => ({ ...s, longBreak: val }))} />
                </div>
            </div>
            
            <hr className="border-black/20" />
            <div>
                <h3 className="text-sm font-semibold uppercase text-light/50 tracking-wider mb-3">{t('audio')}</h3>
                <div className="space-y-3">
                    <SettingsSelect label={t('alarmSound')} value={currentSettings.alarmSound} onChange={(val) => setCurrentSettings(s => ({ ...s, alarmSound: val }))} options={ALARM_SOUNDS} />
                    <SettingsSlider label={t('alarmVolume')} value={currentSettings.alarmVolume} onChange={(val) => setCurrentSettings(s => ({...s, alarmVolume: val}))} />
                    <SettingsSelect label={t('backgroundSound')} value={currentSettings.backgroundSound} onChange={(val) => setCurrentSettings(s => ({ ...s, backgroundSound: val }))} options={BACKGROUND_SOUNDS} />
                    <SettingsSlider label={t('backgroundVolume')} value={currentSettings.backgroundVolume} onChange={(val) => setCurrentSettings(s => ({...s, backgroundVolume: val}))} />
                </div>
            </div>

            <hr className="border-black/20" />
            <div>
                <h3 className="text-sm font-semibold uppercase text-light/50 tracking-wider mb-3">{t('configuration')}</h3>
                <div className="space-y-3">
                    <SettingsInput label={t('longBreakInterval')} value={currentSettings.longBreakInterval} min={2} max={10} onChange={(val) => setCurrentSettings(s => ({ ...s, longBreakInterval: val }))} />
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button onClick={handleSave} className="bg-accent text-text-on-accent font-bold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;