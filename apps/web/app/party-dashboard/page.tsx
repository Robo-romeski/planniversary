"use client";
import React, { useEffect, useState } from "react";
import { api, updateParty, deleteParty } from "@/lib/api";
import Link from "next/link";

interface Party {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
}

export default function PartyDashboardPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Party>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'location'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchParties();
  }, []);

  async function fetchParties() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Party[]>("/api/party");
      setParties(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch parties");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(party: Party) {
    setEditingId(party.id);
    setEditData({ ...party });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit() {
    if (!editingId) return;
    // Basic validation
    if (!editData.name || !editData.date || !editData.location) {
      setError("Name, date, and location are required.");
      return;
    }
    try {
      await updateParty(editingId.toString(), editData);
      setEditingId(null);
      setEditData({});
      fetchParties();
    } catch (err: any) {
      setError(err.message || "Failed to update party");
    }
  }

  async function confirmDelete(id: number) {
    setDeleteId(id);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteParty(deleteId.toString());
      setDeleteId(null);
      fetchParties();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete party");
    }
  }

  // Filtering and sorting logic
  const filteredParties = parties
    .filter(party =>
      party.name.toLowerCase().includes(filter.toLowerCase()) ||
      party.location.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'location') cmp = a.location.localeCompare(b.location);
      else if (sortBy === 'date') cmp = a.date.localeCompare(b.date);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Party Dashboard</h1>
      {/* Filtering and sorting controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
          aria-label="Search parties"
        />
        <div className="flex gap-2 items-center">
          <label htmlFor="sortBy" className="font-semibold">Sort by:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="border rounded px-2 py-1"
            aria-label="Sort by"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
          <button
            onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-2 py-1 border rounded"
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center mb-4">{error}</div>
      ) : filteredParties.length === 0 ? (
        <div className="text-center text-gray-500">No parties found.</div>
      ) : (
        <ul className="space-y-6">
          {filteredParties.map((party) => (
            <li key={party.id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
              {editingId === party.id ? (
                <form
                  className="flex-1 flex flex-col md:flex-row gap-2"
                  onSubmit={e => { e.preventDefault(); saveEdit(); }}
                  aria-label="Edit party form"
                >
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    placeholder="Party Name"
                    className="border rounded px-2 py-1 flex-1"
                    required
                    aria-label="Party Name"
                  />
                  <input
                    type="date"
                    value={editData.date ? editData.date.slice(0, 10) : ""}
                    onChange={e => setEditData(d => ({ ...d, date: e.target.value }))}
                    className="border rounded px-2 py-1 flex-1"
                    required
                    aria-label="Party Date"
                  />
                  <input
                    type="text"
                    value={editData.location || ""}
                    onChange={e => setEditData(d => ({ ...d, location: e.target.value }))}
                    placeholder="Location"
                    className="border rounded px-2 py-1 flex-1"
                    required
                    aria-label="Location"
                  />
                  <input
                    type="text"
                    value={editData.description || ""}
                    onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                    placeholder="Description"
                    className="border rounded px-2 py-1 flex-1"
                    aria-label="Description"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded" aria-label="Save changes">Save</button>
                    <button type="button" className="px-3 py-1 bg-gray-300 text-gray-700 rounded" onClick={cancelEdit} aria-label="Cancel edit">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      <Link href={`/party-dashboard/${party.id}`} className="text-blue-600 hover:underline">
                        {party.name}
                      </Link>
                    </div>
                    <div className="text-gray-600">{party.date.slice(0, 10)} | {party.location}</div>
                    {party.description && <div className="text-gray-500 mt-1">{party.description}</div>}
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={() => startEdit(party)}
                      aria-label={`Edit party ${party.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => confirmDelete(party.id)}
                      aria-label={`Delete party ${party.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this party?</p>
            {deleteError && <div className="text-red-600 mt-2">{deleteError}</div>}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={() => setDeleteId(null)}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDelete}
                aria-label="Confirm delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 