import React, { useState } from 'react';
import { TaskTemplate, Task, TemplateTask } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TemplatesManagerProps {
  templates: TaskTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<TaskTemplate[]>>;
  currentTasks: Task[];
  onClose: () => void;
  onLoadTemplate: (templateId: string) => void;
}

const TemplatesManager: React.FC<TemplatesManagerProps> = ({ templates, setTemplates, currentTasks, onClose, onLoadTemplate }) => {
  const { t } = useLanguage();
  const [templateName, setTemplateName] = useState('');

  const tasksToSave = currentTasks.filter(task => !task.completed);
  const canSave = templateName.trim().length > 0 && tasksToSave.length > 0;

  const handleSaveTemplate = () => {
    if (!canSave) return;

    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      name: templateName.trim(),
      tasks: tasksToSave.map((task): TemplateTask => ({
        text: task.text,
        isSubtask: task.isSubtask ?? false,
        estimatedPomodoros: task.estimatedPomodoros,
      })),
    };
    setTemplates(prev => [...prev, newTemplate]);
    setTemplateName('');
  };

  const handleLoadTemplate = (templateId: string) => {
    // Directly call the onLoadTemplate prop without confirmation.
    // The user's intent is clear from clicking the 'Load' button.
    onLoadTemplate(templateId);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-secondary rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('taskTemplates')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10" aria-label={t('closeTemplates')}><CloseIcon /></button>
        </div>
        
        <div className="mb-4">
            <h3 className="font-semibold text-light mb-2">{t('saveCurrentTasks')}</h3>
            <div className="flex gap-2">
                <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder={t('templateNamePlaceholder')} className="flex-grow bg-primary border-none rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent text-light"/>
                <button 
                  onClick={handleSaveTemplate} 
                  disabled={!canSave}
                  className="bg-accent text-text-on-accent font-bold px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('save')}
                </button>
            </div>
        </div>

        <hr className="border-black/20 my-4" />

        <div className="flex-grow overflow-y-auto">
            <h3 className="font-semibold text-light mb-2">{t('loadTemplate')}</h3>
            <ul className="space-y-2">
                {templates.length > 0 ? templates.map(template => (
                    <li key={template.id} className="flex justify-between items-center p-3 rounded-md hover:bg-primary/50">
                        <span className="flex-grow truncate pr-4">{template.name}</span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button 
                                onClick={() => handleLoadTemplate(template.id)} 
                                className="bg-accent text-text-on-accent font-bold px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity text-sm"
                            >
                                {t('load')}
                            </button>
                            <button 
                                onClick={() => handleDeleteTemplate(template.id)} 
                                className="p-1.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" 
                                aria-label={t('deleteTemplate').replace('{templateName}', template.name)}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </li>
                )) : <p className="text-center text-light/50 py-4">{t('noTemplates')}</p>}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default TemplatesManager;