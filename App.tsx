import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerMode, Task, Settings, PomodoroSession, TaskTemplate, TemplateTask } from './types';
import { DEFAULT_SETTINGS, BACKGROUND_SOUNDS, ALARM_SOUNDS } from './constants';
import Timer from './components/Timer';
import ModeSelector from './components/ModeSelector';
import TaskList from './components/TaskList';
import SettingsModal from './components/SettingsModal';
import FocusBooster from './components/FocusBooster';
import ReportsModal from './components/ReportsModal';
import TemplatesManager from './components/TemplatesManager';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { BookmarkIcon } from './components/icons/BookmarkIcon';
import LanguageSwitcher from './components/LanguageSwitcher';
import useLocalStorage from './hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from './contexts/LanguageContext';

function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [pomodoroHistory, setPomodoroHistory] = useLocalStorage<PomodoroSession[]>('pomodoroHistory', []);
  const [templates, setTemplates] = useLocalStorage<TaskTemplate[]>('templates', []);

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showReports, setShowReports] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { language, t } = useLanguage();

  const getInitialTime = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'pomodoro': return settings.pomodoro * 60;
      case 'shortBreak': return settings.shortBreak * 60;
      case 'longBreak': return settings.longBreak * 60;
      default: return settings.pomodoro * 60;
    }
  };

  const playAlarmSound = useCallback(() => {
    if (alarmSoundRef.current) {
        alarmSoundRef.current.volume = settings.alarmVolume;
        alarmSoundRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  }, [settings.alarmVolume]);

  const handleNextMode = useCallback(() => {
    playAlarmSound();

    if (mode === 'pomodoro') {
        const newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);

        const activeTask = tasks.find(t => t.id === activeTaskId);

        // Log session
        setPomodoroHistory(prev => [...prev, {
            timestamp: Date.now(),
            taskId: activeTaskId,
            taskText: activeTask?.text || 'Unassigned'
        }]);
        
        // Update task progress
        if (activeTaskId) {
            const newTasks = tasks.map(task => {
                if (task.id === activeTaskId) {
                    const newCompletedPomodoros = task.completedPomodoros + 1;
                    const isNowCompleted = newCompletedPomodoros >= task.estimatedPomodoros;
                    if(isNowCompleted) setActiveTaskId(null); // Deselect task if completed
                    return { ...task, completedPomodoros: newCompletedPomodoros, completed: isNowCompleted };
                }
                return task;
            });
            setTasks(newTasks);
        }
        
        if (newPomodoroCount > 0 && newPomodoroCount % settings.longBreakInterval === 0) {
            setMode('longBreak');
        } else {
            setMode('shortBreak');
        }
    } else {
      setMode('pomodoro');
    }
    setIsActive(false);
  }, [mode, pomodoroCount, settings, activeTaskId, tasks, playAlarmSound, setPomodoroHistory, setTasks]);
  
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-pomodoro', 'theme-shortBreak', 'theme-longBreak');

    switch (mode) {
      case 'pomodoro':
        body.classList.add('theme-pomodoro');
        break;
      case 'shortBreak':
        body.classList.add('theme-shortBreak');
        break;
      case 'longBreak':
        body.classList.add('theme-longBreak');
        break;
    }
  }, [mode]);

  useEffect(() => {
    setTimeRemaining(getInitialTime(mode));
    const timeString = `(${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')})`;
    const newTitle = `${timeString} ${t('title')}`;
    document.title = newTitle;
  }, [mode, settings, t, language]); // Add language dependency
  
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
        const newTitle = `(${String(Math.floor((timeRemaining - 1) / 60)).padStart(2, '0')}:${String((timeRemaining - 1) % 60).padStart(2, '0')}) ${t('title')}`;
        document.title = newTitle;
      }, 1000);
    } else if (timeRemaining === 0 && isActive) {
      handleNextMode();
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, handleNextMode, t, language]);

  useEffect(() => {
    const audioEl = bgAudioRef.current;
    if (!audioEl) return;

    const soundUrl = BACKGROUND_SOUNDS.find(s => s.id === settings.backgroundSound)?.url || '';
    const shouldPlay = isActive && mode === 'pomodoro' && !!soundUrl;

    if (shouldPlay) {
        // Ensure the source is correct before playing.
        // Using currentSrc is more reliable for reading the active source URL.
        if (audioEl.currentSrc !== soundUrl) {
            audioEl.src = soundUrl;
        }

        audioEl.loop = true;
        audioEl.volume = settings.backgroundVolume;

        // The play() method returns a promise which handles the asynchronous nature of loading and playing.
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Ignore AbortError which can happen if the user pauses immediately after playing.
                if (error.name !== 'AbortError') {
                    console.error("Error playing background sound:", error);
                }
            });
        }
    } else {
        audioEl.pause();
        // If the sound option is 'none', we should also clear the source to free up resources.
        if (settings.backgroundSound === 'none' && audioEl.src) {
            audioEl.src = '';
        }
    }
}, [settings.backgroundSound, settings.backgroundVolume, isActive, mode]);
  
  const toggleTimer = () => {
    if (timeRemaining === 0) setTimeRemaining(getInitialTime(mode));
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(getInitialTime(mode));
  };

  const selectMode = (newMode: TimerMode) => {
    if (isActive && !window.confirm(t('confirmSwitch'))) return;
    setMode(newMode);
    setIsActive(false);
  };

  const addTask = (text: string, estimatedPomodoros: number) => {
    const newTask: Task = { id: uuidv4(), text, completed: false, estimatedPomodoros, completedPomodoros: 0 };
    setTasks(prev => [...prev, newTask]);
  };
  
  const addSubTasks = (parentTaskId: string, subTaskTexts: string[]) => {
    const parentTaskIndex = tasks.findIndex(task => task.id === parentTaskId);
    if (parentTaskIndex === -1) return;

    const subTasks: Task[] = subTaskTexts.map(text => ({ id: uuidv4(), text, completed: false, isSubtask: true, estimatedPomodoros: 1, completedPomodoros: 0 }));
    const newTasks = [...tasks];
    newTasks.splice(parentTaskIndex + 1, 0, ...subTasks);
    setTasks(newTasks);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const editTask = (id: string, newText: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, text: newText } : task));
  };

  const handleSettingsSave = (newSettings: Settings) => {
    setSettings(newSettings);
    setShowSettings(false);
    if (!isActive) {
      if (mode === 'pomodoro') setTimeRemaining(newSettings.pomodoro * 60);
      else if (mode === 'shortBreak') setTimeRemaining(newSettings.shortBreak * 60);
      else if (mode === 'longBreak') setTimeRemaining(newSettings.longBreak * 60);
    }
  };

  const handleSetActiveTask = (id: string | null) => {
    setActiveTaskId(id);
    // If a new task is selected and the timer is paused, start it.
    if (id !== null && !isActive) {
      if (mode !== 'pomodoro') {
        // Switch to pomodoro mode if on a break
        setMode('pomodoro'); // useEffect will reset the time
        setIsActive(true);
      } else {
        // If already in pomodoro mode, just resume
        if (timeRemaining === 0) {
            setTimeRemaining(settings.pomodoro * 60);
        }
        setIsActive(true);
      }
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const templateToLoad = templates.find(t => t.id === templateId);

    if (!templateToLoad) {
        console.error("Template not found:", templateId);
        return;
    }

    setShowTemplates(false);
    setIsLoading(true);

    setTimeout(() => {
        if (!Array.isArray(templateToLoad.tasks)) {
            console.error("Template tasks are not an array:", templateToLoad);
            setTasks([]); // Clear tasks as a fallback
        } else {
            const newTasks: Task[] = templateToLoad.tasks.map((templateTask: TemplateTask) => ({
                id: uuidv4(),
                text: templateTask.text,
                completed: false,
                isSubtask: templateTask.isSubtask || false, // Defensive check
                estimatedPomodoros: templateTask.estimatedPomodoros || 1, // Defensive check
                completedPomodoros: 0,
            }));
            setTasks(newTasks);
        }
        
        setActiveTaskId(null);
        setIsLoading(false);
    }, 500); // 500ms delay for the animation
  };

  const calculateFinishTime = () => {
    const remainingPomodoros = tasks.reduce((acc, task) => {
        if (!task.completed) {
            return acc + (task.estimatedPomodoros - task.completedPomodoros);
        }
        return acc;
    }, 0);

    if (remainingPomodoros <= 0) return null;

    const totalMinutes = remainingPomodoros * settings.pomodoro;
    const shortBreaks = remainingPomodoros - Math.floor(remainingPomodoros / settings.longBreakInterval);
    const longBreaks = Math.floor((pomodoroCount + remainingPomodoros - 1) / settings.longBreakInterval) - Math.floor(pomodoroCount / settings.longBreakInterval);
    
    const totalBreakMinutes = (shortBreaks * settings.shortBreak) + (longBreaks * settings.longBreak);
    const totalDuration = totalMinutes + totalBreakMinutes;

    const finishTime = new Date(Date.now() + totalDuration * 60 * 1000);
    return finishTime.toLocaleTimeString(language === 'zh-TW' ? 'zh-Hant' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
  };

  const alarmSoundUrl = ALARM_SOUNDS.find(s => s.id === settings.alarmSound)?.url;

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 sm:pt-12 md:pt-16 p-4 font-sans">
      <audio ref={alarmSoundRef} src={alarmSoundUrl} preload="auto"></audio>
      <audio ref={bgAudioRef} preload="auto"></audio>

      <div className="w-full max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-light">{t('title')}</h1>
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button onClick={() => setShowTemplates(true)} className="p-2 rounded-full hover:bg-black/10 transition-colors" aria-label={t('openTemplates')}><BookmarkIcon /></button>
                <button onClick={() => setShowReports(true)} className="p-2 rounded-full hover:bg-black/10 transition-colors" aria-label={t('openReports')}><ChartBarIcon /></button>
                <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-black/10 transition-colors" aria-label={t('openSettings')}><SettingsIcon /></button>
            </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-secondary rounded-lg p-6">
                <ModeSelector currentMode={mode} onSelectMode={selectMode} />
                <Timer
                  mode={mode}
                  timeRemaining={timeRemaining}
                  totalTime={getInitialTime(mode)}
                  isActive={isActive}
                  onToggle={toggleTimer}
                  onReset={resetTimer}
                />
            </div>
            <FocusBooster />
          </div>

          <div className="lg:col-span-3">
            <TaskList 
              tasks={tasks}
              isLoading={isLoading}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onAddSubTasks={addSubTasks}
              onEditTask={editTask}
              activeTaskId={activeTaskId}
              onSetActiveTask={handleSetActiveTask}
              estimatedFinishTime={calculateFinishTime()}
            />
          </div>
        </main>
      </div>

      {showSettings && <SettingsModal settings={settings} onSave={handleSettingsSave} onClose={() => setShowSettings(false)} />}
      {showReports && <ReportsModal history={pomodoroHistory} tasks={tasks} onClose={() => setShowReports(false)} />}
      {showTemplates && <TemplatesManager templates={templates} setTemplates={setTemplates} currentTasks={tasks} onClose={() => setShowTemplates(false)} onLoadTemplate={handleLoadTemplate} />}
    </div>
  );
}

export default App;