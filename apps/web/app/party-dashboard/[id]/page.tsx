"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Party {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
}

interface Guest {
  id: number;
  name: string;
  email: string;
  response?: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function PartyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params?.id as string;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestLoading, setGuestLoading] = useState(true);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [addingGuest, setAddingGuest] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  useEffect(() => {
    if (!partyId) return;
    setLoading(true);
    setError(null);
    api.get<Party>(`/api/party/${partyId}`)
      .then(setParty)
      .catch(err => setError(err.message || "Failed to fetch event"))
      .finally(() => setLoading(false));
    // Fetch guests
    setGuestLoading(true);
    setGuestError(null);
    api.get<Guest[]>(`/api/party/${partyId}/guests`)
      .then(setGuests)
      .catch(err => setGuestError(err.message || "Failed to fetch guests"))
      .finally(() => setGuestLoading(false));
  }, [partyId]);

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!newGuest.name || !newGuest.email) return;
    setAddingGuest(true);
    setGuestError(null);
    try {
      await api.post(`/api/party/${partyId}/guests`, { guests: [newGuest] });
      setNewGuest({ name: '', email: '' });
      // Refresh guest list
      const updated = await api.get<Guest[]>(`/api/party/${partyId}/guests`);
      setGuests(updated);
    } catch (err: any) {
      setGuestError(err.message || "Failed to add guest");
    } finally {
      setAddingGuest(false);
    }
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(ts => [
      ...ts,
      { id: Math.random().toString(36).slice(2), text: newTask.trim(), completed: false },
    ]);
    setNewTask('');
  }

  function handleToggleTask(id: string) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function handleRemoveTask(id: string) {
    setTasks(ts => ts.filter(t => t.id !== id));
  }

  function startEditTask(id: string, text: string) {
    setEditingTaskId(id);
    setEditingTaskText(text);
  }

  function handleEditTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTaskId) return;
    setTasks(ts => ts.map(t => t.id === editingTaskId ? { ...t, text: editingTaskText } : t));
    setEditingTaskId(null);
    setEditingTaskText('');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/party-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6 text-center">Event Details</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center mb-4">{error}</div>
      ) : !party ? (
        <div className="text-center text-gray-500">Event not found.</div>
      ) : (
        <div className="bg-white rounded shadow p-6">
          <div className="font-bold text-xl mb-2">{party.name}</div>
          <div className="text-gray-600 mb-2">{party.date.slice(0, 10)} | {party.location}</div>
          {party.description && <div className="text-gray-500 mb-4">{party.description}</div>}
          {/* TODO: Add edit controls here */}
          <hr className="my-6" />
          <h2 className="text-lg font-semibold mb-2">Guests</h2>
          {guestLoading ? (
            <div className="text-gray-400 mb-4">Loading guests...</div>
          ) : guestError ? (
            <div className="text-red-600 mb-4">{guestError}</div>
          ) : (
            <>
              <ul className="mb-4">
                {guests.map(guest => (
                  <li key={guest.id} className="flex items-center gap-2 border-b py-1">
                    <span className="font-medium">{guest.name}</span>
                    <span className="text-gray-600 text-sm">({guest.email})</span>
                    {guest.response && <span className="ml-2 text-xs text-blue-600">RSVP: {guest.response}</span>}
                  </li>
                ))}
                {guests.length === 0 && <li className="text-gray-400">No guests yet.</li>}
              </ul>
              <form onSubmit={handleAddGuest} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Guest name"
                  value={newGuest.name}
                  onChange={e => setNewGuest(g => ({ ...g, name: e.target.value }))}
                  className="border rounded px-2 py-1 flex-1"
                  required
                  aria-label="Guest name"
                />
                <input
                  type="email"
                  placeholder="Guest email"
                  value={newGuest.email}
                  onChange={e => setNewGuest(g => ({ ...g, email: e.target.value }))}
                  className="border rounded px-2 py-1 flex-1"
                  required
                  aria-label="Guest email"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  disabled={addingGuest}
                  aria-label="Add guest"
                >
                  Add
                </button>
              </form>
            </>
          )}
          <hr className="my-6" />
          <h2 className="text-lg font-semibold mb-2">Tasks</h2>
          <ul className="mb-4">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center gap-2 border-b py-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                />
                {editingTaskId === task.id ? (
                  <form onSubmit={handleEditTask} className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editingTaskText}
                      onChange={e => setEditingTaskText(e.target.value)}
                      className="border rounded px-2 py-1 flex-1"
                      required
                      aria-label="Edit task"
                    />
                    <button type="submit" className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                    <button type="button" className="px-2 py-1 bg-gray-300 text-gray-700 rounded" onClick={() => setEditingTaskId(null)}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.text}</span>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                      onClick={() => startEditTask(task.id, task.text)}
                      aria-label="Edit task"
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                      onClick={() => handleRemoveTask(task.id)}
                      aria-label="Remove task"
                    >
                      Remove
                    </button>
                  </>
                )}
              </li>
            ))}
            {tasks.length === 0 && <li className="text-gray-400">No tasks yet.</li>}
          </ul>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a new task"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              className="border rounded px-2 py-1 flex-1"
              required
              aria-label="New task"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-green-600 text-white rounded"
              aria-label="Add task"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 