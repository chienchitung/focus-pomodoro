export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isSubtask?: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  alarmSound: string;
  alarmVolume: number;
  backgroundSound: string;
  backgroundVolume: number;
}

export interface PomodoroSession {
    timestamp: number; // UTC milliseconds
    taskId: string | null;
    taskText: string;
}

// Explicit type for a task within a template for clarity and robustness.
export interface TemplateTask {
  text: string;
  isSubtask: boolean;
  estimatedPomodoros: number;
}

export interface TaskTemplate {
    id:string;
    name: string;
    tasks: TemplateTask[];
}