import React, { useState } from 'react';
import { type ShiftStatus, type DaySchedule, type Note } from '../../types/schedule';
import { MessageCircle } from 'lucide-react';
import { StatusModal } from './StatusModal';
import { getStatusColor, getStatusLabel } from '../../constants/statusConfig';

interface DayCellProps {
  schedule: DaySchedule;
  onUpdateSchedule: (status: ShiftStatus, notes: Note[]) => void;
  isEditable: boolean;
  currentUser: { id: string; username: string };
  isWeekend: boolean;
}

export function DayCell({ schedule, onUpdateSchedule, isEditable, currentUser, isWeekend }: DayCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentSchedule: DaySchedule = {
    status: schedule?.status || 'none',
    notes: schedule?.notes || []
  };

  const handleStatusClick = (newStatus: ShiftStatus) => {
    onUpdateSchedule(newStatus, currentSchedule.notes);
    setIsModalOpen(false);
  };

  const statusColor = getStatusColor(currentSchedule.status);
  const statusLabel = getStatusLabel(currentSchedule.status);

  return (
    <>
      <div
        onClick={() => isEditable && setIsModalOpen(true)}
        className={`w-8 h-8 flex items-center justify-center ${
          isEditable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'
        } rounded ${statusColor} ${
          isWeekend ? 'bg-gray-400' : ''
        } relative group transition-all duration-200`}
      >
        <div className="flex flex-col items-center">
          {statusLabel}
          {currentSchedule.notes.length > 0 && (
            <MessageCircle size={12} className="absolute -top-1 -right-1" />
          )}
        </div>
        {currentSchedule.notes.length > 0 && (
          <div className="absolute hidden group-hover:block bg-gray-800 text-white p-2 rounded text-sm -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 max-w-xs">
            {currentSchedule.notes.map((note, index) => (
              <div key={note.timestamp} className={index > 0 ? 'mt-1 pt-1 border-t border-gray-700' : ''}>
                <span className="font-semibold">{note.author}:</span> {note.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <StatusModal
          currentSchedule={currentSchedule}
          onUpdateSchedule={handleStatusClick}
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
}