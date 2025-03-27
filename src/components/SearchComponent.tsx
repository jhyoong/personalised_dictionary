import React, { useState } from 'react';

interface Entry {
  key: string;
  content: string;
}

export default function SearchComponent() {
  const [searchKey, setSearchKey] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
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
    }
  };

  const handleListAll = async () => {
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
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
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
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Search
        </button>
        <button 
          onClick={handleListAll}
          className="bg-green-500 text-white p-2 rounded ml-2"
        >
          List All
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="border rounded">
          {results.map((entry, index) => (
            <div 
              key={index} 
              className="p-4 border-b last:border-b-0"
            >
              <h3 className="font-bold">Searched: {entry.key}</h3>
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}