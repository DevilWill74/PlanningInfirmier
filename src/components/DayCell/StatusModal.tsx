import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { type ShiftStatus, type DaySchedule, type Note } from '../../types/schedule';
import { STATUS_CONFIG } from '../../constants/statusConfig';

interface StatusModalProps {
  currentSchedule: DaySchedule;
  onUpdateSchedule: (status: ShiftStatus, notes: Note[]) => void;
  onClose: () => void;
  currentUser: { id: string; username: string };
}

export function StatusModal({ currentSchedule, onUpdateSchedule, onClose, currentUser }: StatusModalProps) {
  const [newNote, setNewNote] = useState('');

  const handleStatusClick = (newStatus: ShiftStatus) => {
    onUpdateSchedule(newStatus, currentSchedule.notes);
    onClose();
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        text: newNote.trim(),
        author: currentUser.username,
        authorId: currentUser.id,
        timestamp: Date.now()
      };
      const updatedNotes = [...currentSchedule.notes, newNoteObj];
      onUpdateSchedule(currentSchedule.status, updatedNotes);
      setNewNote('');
    }
  };

  const handleDeleteNote = (timestamp: number) => {
    const updatedNotes = currentSchedule.notes.filter(note => note.timestamp !== timestamp);
    onUpdateSchedule(currentSchedule.status, updatedNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Modifier le statut</h3>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
            <button
              key={statusKey}
              onClick={() => handleStatusClick(statusKey as ShiftStatus)}
              className={`p-2 rounded ${config.color} hover:opacity-80 transition-opacity`}
            >
              {config.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          {currentSchedule.notes.map((note) => (
            <div key={note.timestamp} className="mb-2 p-2 bg-gray-50 rounded flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">{note.author}:</div>
                <div>{note.text}</div>
              </div>
              {(note.authorId === currentUser.id) && (
                <button
                  onClick={() => handleDeleteNote(note.timestamp)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Supprimer la note"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              placeholder="Ajouter une note..."
              rows={2}
            />
            <button
              onClick={handleAddNote}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-end"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}