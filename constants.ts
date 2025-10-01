import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  alarmSound: 'notification',
  alarmVolume: 0.5,
  backgroundSound: 'none',
  backgroundVolume: 0.2,
};

export const ALARM_SOUNDS = [
    { id: 'notification', name: 'Notification', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3'},
    { id: 'bell', name: 'Bell', url: 'https://assets.mixkit.co/sfx/preview/mixkit-clear-announce-tones-2861.mp3' },
    { id: 'chime', name: 'Chime', url: 'https://assets.mixkit.co/sfx/preview/mixkit-instrument-success-notification-681.mp3' },
];

export const BACKGROUND_SOUNDS = [
    { id: 'none', name: 'None', url: '' },
    { id: 'rain', name: 'Rain', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-looping-1253.mp3' },
    { id: 'coffee-shop', name: 'Coffee Shop', url: 'https://assets.mixkit.co/sfx/preview/mixkit-small-group-of-people-in-a-cafe-248.mp3' },
    { id: 'forest', name: 'Forest', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-at-night-1222.mp3' },
];
