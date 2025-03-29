import React, { useState, FormEvent } from 'react';

interface Entry {
  key: string;
  content: string;
}

export default function EntryForm() {
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, content }),
      });

      if (response.ok) {
        setMessage('Entry added successfully!');
        setMessageType('success');
        setKey('');
        setContent('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while adding the entry.');
      setMessageType('error');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="key" className="block mb-2 font-medium">
            Search Key
          </label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block mb-2 font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full p-2 border rounded h-32"
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add Entry
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 
          messageType === 'error' ? 'bg-red-100 text-red-800' : ''
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}