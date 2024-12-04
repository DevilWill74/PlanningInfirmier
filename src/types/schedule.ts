export interface Nurse {
  id: string;
  name: string;
}

export type ShiftStatus = 'travail' | 'repos' | 'vacances' | 'formation' | 'indisponible' | 'none';

export interface Note {
  text: string;
  author: string;
  authorId: string;
  timestamp: number;
}

export interface DaySchedule {
  status: ShiftStatus;
  notes: Note[];
}

export type MonthlySchedule = {
  [key: string]: DaySchedule[];
};