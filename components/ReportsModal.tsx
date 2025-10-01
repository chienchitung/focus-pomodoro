import React, { useState } from 'react';
import { PomodoroSession, Task } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';
import BarChart from './BarChart';

interface ReportsModalProps {
  history: PomodoroSession[];
  tasks: Task[];
  onClose: () => void;
}

type Timeframe = 'day' | 'week' | 'month';

const ReportsModal: React.FC<ReportsModalProps> = ({ history, tasks, onClose }) => {
    const { t } = useLanguage();
    const [timeframe, setTimeframe] = useState<Timeframe>('week');

    const filterAndGroupData = () => {
        const now = new Date();
        let startDate = new Date();

        switch (timeframe) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const filteredHistory = history.filter(session => session.timestamp >= startDate.getTime());

        const groupedData: { [key: string]: number } = {};
        
        filteredHistory.forEach(session => {
            const date = new Date(session.timestamp);
            let key = '';
            if (timeframe === 'day') key = date.toLocaleTimeString([], { hour: '2-digit' });
            else if (timeframe === 'week') key = date.toLocaleDateString([], { weekday: 'short' });
            else if (timeframe === 'month') key = `W${Math.ceil(date.getDate() / 7)}`;
            
            if(!groupedData[key]) groupedData[key] = 0;
            groupedData[key]++;
        });

        if (timeframe === 'week') {
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const sortedData: { [key: string]: number } = {};
            weekDays.forEach(day => {
                if (groupedData[day]) sortedData[day] = groupedData[day];
            });
            return Object.entries(sortedData).map(([label, value]) => ({ label, value }));
        }

        return Object.entries(groupedData).map(([label, value]) => ({ label, value }));
    };

    const chartData = filterAndGroupData();
    const totalPomodoros = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-secondary rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('productivityReport')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10" aria-label={t('closeReports')}><CloseIcon /></button>
                </div>
                <div className="flex justify-center bg-black/10 p-1.5 rounded-full mb-4">
                    {(['day', 'week', 'month'] as Timeframe[]).map(tf => (
                        <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors duration-300 w-1/3 ${timeframe === tf ? 'bg-accent text-text-on-accent' : 'text-light/70 hover:bg-black/10'}`}>
                            {t(tf)}
                        </button>
                    ))}
                </div>
                <div className="flex-grow overflow-y-auto">
                    {chartData.length > 0 ? (
                        <>
                            <p className="text-center text-light/80 mb-4">{t('totalPomodoros')}: <span className="font-bold text-accent">{totalPomodoros}</span></p>
                            <BarChart data={chartData} />
                        </>
                    ) : (
                        <p className="text-center text-light/50 py-16">{t('noSessions')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;