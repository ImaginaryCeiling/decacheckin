'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setStatus('Parsing...');
    
    try {
      // Parse CSV: expected "ID, Name" or just tabs from Excel
      const lines = input.trim().split('\n');
      const users = lines.map(line => {
        // Split by comma or tab
        const parts = line.split(/,|\t/);
        if (parts.length < 2) return null;
        
        // Clean up
        const id = parts[0].trim();
        const name = parts[1].trim();
        
        if (!id || !name) return null;
        return { id, name };
      }).filter(Boolean);

      if (users.length === 0) {
        setStatus('No valid users found. Check format (ID, Name)');
        setLoading(false);
        return;
      }

      setStatus(`Uploading ${users.length} users...`);

      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`Success! Uploaded ${data.count} users.`);
        setInput('');
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Failed to upload. Check console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Seed Database</h1>
        <p className="text-sm text-gray-600 mb-4">
          Paste your spreadsheet data below. Format: <code>ID, Name</code> (CSV) or copy directly from Excel/Sheets.
        </p>
        
        <textarea
          className="w-full h-64 p-3 border rounded font-mono text-sm mb-4"
          placeholder="123, John Doe&#10;124, Jane Smith"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="flex justify-between items-center">
          <button
            onClick={handleSeed}
            disabled={loading || !input}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Users'}
          </button>
          
          <span className="text-sm font-medium text-gray-700">{status}</span>
        </div>

        <div className="mt-6 pt-6 border-t">
           <a href="/" className="text-blue-600 hover:underline">&larr; Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}

