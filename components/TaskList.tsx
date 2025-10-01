import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { breakDownTask } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string, estimatedPomodoros: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddSubTasks: (parentTaskId: string, subTaskTexts: string[]) => void;
  onEditTask: (id: string, newText: string) => void;
  activeTaskId: string | null;
  onSetActiveTask: (id: string | null) => void;
  estimatedFinishTime: string | null;
  isLoading: boolean;
}

const TaskItem: React.FC<{ 
    task: Task; 
    isActive: boolean;
    onToggleTask: (id: string) => void; 
    onDeleteTask: (id: string) => void; 
    onAddSubTasks: (parentTaskId: string, subTaskTexts: string[]) => void; 
    onEditTask: (id: string, newText: string) => void;
    onSetActiveTask: (id: string | null) => void;
}> = ({ task, isActive, onToggleTask, onDeleteTask, onAddSubTasks, onEditTask, onSetActiveTask }) => {
    const { language, t } = useLanguage();

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [showBreakdownOptions, setShowBreakdownOptions] = useState(false);
    const [breakdownCount, setBreakdownCount] = useState<number | ''>('');
    const [breakdownDetail, setBreakdownDetail] = useState('Balanced');

    const inputRef = useRef<HTMLInputElement>(null);
    const breakdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (breakdownRef.current && !breakdownRef.current.contains(event.target as Node)) {
                setShowBreakdownOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditSubmit = () => {
        if (editText.trim() && editText.trim() !== task.text) {
            onEditTask(task.id, editText.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleEditSubmit();
        else if (e.key === 'Escape') {
            setEditText(task.text);
            setIsEditing(false);
        }
    };
    
    const handleGenerateBreakdown = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setShowBreakdownOptions(false);
        const subTasks = await breakDownTask(task.text, language, breakdownCount === '' ? undefined : breakdownCount, breakdownDetail);
        if (subTasks && subTasks.length > 0) {
            onAddSubTasks(task.id, subTasks);
        }
        setIsLoading(false);
        setBreakdownCount('');
        setBreakdownDetail('Balanced');
    };

    const handleToggleActive = () => {
        onSetActiveTask(isActive ? null : task.id);
    };

    return (
        <li className={`relative flex items-center justify-between p-3 rounded-md group transition-colors ${task.isSubtask ? 'pl-10' : ''} ${task.completed ? 'opacity-50' : ''} ${isActive ? 'bg-accent/20' : 'hover:bg-black/10'}`}>
            <div className="flex items-center space-x-3 flex-grow min-w-0">
                 {!task.completed && (
                    <button onClick={handleToggleActive} className="flex-shrink-0" aria-label={isActive ? t('deselectActiveTask') : t('selectActiveTask')}>
                        {isActive ? <StopCircleIcon /> : <PlayCircleIcon />}
                    </button>
                 )}
                 {task.completed && <div className="w-6 h-6 flex-shrink-0"></div>}
                
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="w-5 h-5 rounded bg-primary border-secondary text-accent focus:ring-accent focus:ring-offset-secondary flex-shrink-0"
                />
                {isEditing ? (
                     <input ref={inputRef} type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={handleEditSubmit} onKeyDown={handleKeyDown} className="flex-grow bg-black/20 border border-accent rounded-md p-1 -m-1 focus:outline-none focus:ring-1 focus:ring-accent text-light w-full" />
                ) : (
                    <span onDoubleClick={() => !task.completed && setIsEditing(true)} className={`flex-1 truncate ${task.completed ? 'line-through text-light/60' : 'text-light'}`}>{task.text}</span>
                )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                 <span className="text-sm text-light/50 font-mono">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                 <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {!task.completed && (
                        <button onClick={() => setIsEditing(true)} className="p-1 text-light/70 hover:text-light" aria-label={t('editTask')}><EditIcon /></button>
                    )}
                    {!task.isSubtask && !task.completed && (
                        <div className="relative">
                            <button onClick={() => setShowBreakdownOptions(s => !s)} disabled={isLoading} className="p-1 text-accent hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('breakdownTask')}>
                                {isLoading ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon />}
                            </button>
                            {showBreakdownOptions && (
                                <div ref={breakdownRef} className="absolute right-0 top-full mt-2 w-64 bg-primary border border-secondary rounded-lg shadow-xl p-4 z-10">
                                    <form onSubmit={handleGenerateBreakdown}>
                                        <h4 className="font-semibold text-light mb-3 text-sm">{t('breakdownOptions')}</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-light/70 mb-1">{t('numSubtasks')}</label>
                                                <input type="number" value={breakdownCount} onChange={(e) => setBreakdownCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder={t('numSubtasksPlaceholder')} min="1" className="w-full bg-secondary border-gray-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-light/70 mb-1">{t('detailLevel')}</label>
                                                <select value={breakdownDetail} onChange={(e) => setBreakdownDetail(e.target.value)} className="w-full bg-secondary border-gray-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                                                    <option value="Quick">{t('detailQuick')}</option>
                                                    <option value="Balanced">{t('detailBalanced')}</option>
                                                    <option value="Detailed">{t('detailDetailed')}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button type="submit" className="bg-accent text-text-on-accent font-bold px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition-opacity">{t('generate')}</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => onDeleteTask(task.id)} className="p-1 text-red-500 hover:text-red-400" aria-label={t('deleteTask')}><TrashIcon /></button>
                 </div>
            </div>
        </li>
    );
};


const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onAddSubTasks, onEditTask, activeTaskId, onSetActiveTask, estimatedFinishTime, isLoading }) => {
  const { t } = useLanguage();
  const [newTask, setNewTask] = useState('');
  const [pomodoros, setPomodoros] = useState<number | ''>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && pomodoros && pomodoros > 0) {
      onAddTask(newTask.trim(), pomodoros);
      setNewTask('');
      setPomodoros(1);
    }
  };

  return (
    <div className="bg-secondary p-4 rounded-lg h-full flex flex-col relative">
      {isLoading && (
          <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center z-20 rounded-lg backdrop-blur-sm">
              <SpinnerIcon />
          </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{t('tasks')}</h2>
        {estimatedFinishTime && (
            <div className="text-sm text-light/70">
                {t('estFinish')}: <span className="font-bold text-light">{estimatedFinishTime}</span>
            </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex mb-4 gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={t('addTaskPlaceholder')}
          className="flex-grow bg-primary border-none rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent text-light"
        />
        <input
            type="number"
            value={pomodoros}
            onChange={(e) => setPomodoros(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            min="1"
            className="w-20 bg-primary border-none rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent text-light text-center"
            aria-label={t('estimatedPomodoros')}
        />
        <button type="submit" className="bg-accent text-text-on-accent font-bold px-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center">
          <PlusIcon />
        </button>
      </form>
      <ul className="space-y-1 overflow-y-auto flex-grow">
        {tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.id} task={task} isActive={task.id === activeTaskId} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onAddSubTasks={onAddSubTasks} onEditTask={onEditTask} onSetActiveTask={onSetActiveTask} />)
        ) : (
            <p className="text-center text-light/50 py-4">{t('noTasks')}</p>
        )}
      </ul>
    </div>
  );
};

export default TaskList;