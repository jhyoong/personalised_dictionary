import React, { useState } from 'react';

interface Entry {
  key: string;
  content: string;
}

export default function SearchComponent() {
  const [searchKey, setSearchKey] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entries?search=${encodeURIComponent(searchKey)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data);
      setError('');
    } catch (err) {
      setError('Error searching entries');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListAll = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/entries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      
      const data = await response.json();
      setResults(data);
      setError('');
    } catch (err) {
      setError('Error listing entries');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search entries..."
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
          disabled={loading}
        >
          Search
        </button>
      </div>
      
      <button 
        onClick={handleListAll}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 w-full mb-4"
        disabled={loading}
      >
        List All Entries
      </button>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-4 max-h-96 overflow-y-auto">
        {results.length > 0 ? (
          <div className="border rounded divide-y">
            {results.map((entry, index) => (
              <div key={index} className="p-4">
                <h3 className="font-bold">Searched: {entry.key}</h3>
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>
        ) : !loading && !error && (
          <p className="text-gray-500">No entries found.</p>
        )}
      </div>
    </div>
  );
}