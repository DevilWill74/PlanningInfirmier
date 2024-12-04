import React from 'react';
import { Trash2 } from 'lucide-react';
import { type MonthlySchedule, type Nurse, type ShiftStatus, type Note } from '../types/schedule';
import { type User } from '../types/auth';
import { DayCell } from './DayCell';

interface ScheduleTableProps {
  nurses: Nurse[];
  schedule: MonthlySchedule;
  onUpdateSchedule: (nurseId: string, day: number, status: ShiftStatus, notes: Note[]) => void;
  onDeleteNurse: (nurseId: string) => void;
  currentUser: User;
  isAdmin: boolean;
  currentDate: Date;
  getCurrentSchedule: (nurseId: string) => DaySchedule[];
}

export function ScheduleTable({ 
  nurses, 
  schedule, 
  onUpdateSchedule,
  onDeleteNurse,
  currentUser,
  isAdmin,
  currentDate,
  getCurrentSchedule
}: ScheduleTableProps) {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isWeekend = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const displayedNurses = isAdmin 
    ? nurses 
    : nurses.filter(nurse => nurse.id === currentUser.id);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 border-b border-r text-left font-semibold text-gray-600 min-w-[200px]">
              Infirmiers
            </th>
            {days.map((day) => (
              <th
                key={day}
                className={`w-12 px-2 py-2 border-b border-r text-center font-semibold text-gray-600 ${
                  isWeekend(day) ? 'bg-gray-200' : ''
                }`}
              >
                {day}
              </th>
            ))}
            {isAdmin && <th className="w-16 px-2 py-2 border-b text-center font-semibold text-gray-600">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedNurses.map((nurse) => (
            <tr key={nurse.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b border-r font-medium flex items-center justify-between">
                <span>{nurse.name}</span>
                {isAdmin && (
                  <button
                    onClick={() => onDeleteNurse(nurse.id)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </td>
              {days.map((day) => {
                const nurseSchedule = getCurrentSchedule(nurse.id);
                const defaultSchedule = { status: 'none' as ShiftStatus, notes: [] };
                return (
                  <td
                    key={day}
                    className={`border-b border-r text-center p-2 ${
                      isWeekend(day) ? 'bg-gray-200' : ''
                    }`}
                  >
                    <DayCell
                      schedule={nurseSchedule[day - 1] || defaultSchedule}
                      onUpdateSchedule={(status, notes) => 
                        onUpdateSchedule(nurse.id, day - 1, status, notes)
                      }
                      isEditable={isAdmin || nurse.id === currentUser.id}
                      currentUser={currentUser}
                      isWeekend={isWeekend(day)}
                    />
                  </td>
                );
              })}
              {isAdmin && <td className="border-b"></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}