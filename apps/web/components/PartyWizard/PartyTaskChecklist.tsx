import React, { useState } from 'react';

export interface PartyTask {
  id: string;
  text: string;
  completed: boolean;
}

const DEFAULT_TASKS: PartyTask[] = [
  { id: 'invitations', text: 'Send invitations', completed: false },
  { id: 'food', text: 'Arrange food and drinks', completed: false },
  { id: 'decor', text: 'Set up decorations', completed: false },
  { id: 'music', text: 'Organize music/entertainment', completed: false },
  { id: 'venue', text: 'Confirm venue booking', completed: false },
];

export default function PartyTaskChecklist({ value = DEFAULT_TASKS, onChange }: {
  value?: PartyTask[];
  onChange: (tasks: PartyTask[]) => void;
}) {
  const [input, setInput] = useState('');

  const handleToggle = (id: string) => {
    const updated = value.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    onChange(updated);
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newTask: PartyTask = {
      id: Math.random().toString(36).slice(2),
      text: input.trim(),
      completed: false,
    };
    onChange([...value, newTask]);
    setInput('');
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(task => task.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Party Planning Checklist</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>
      <ul className="space-y-3">
        {value.map(task => (
          <li key={task.id} className="flex items-center gap-3 bg-gray-50 rounded p-3 border">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id)}
              className="w-5 h-5 accent-green-500"
            />
            <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.text}</span>
            <button
              className="text-red-500 hover:underline text-sm"
              onClick={() => handleRemove(task.id)}
              aria-label="Remove task"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 