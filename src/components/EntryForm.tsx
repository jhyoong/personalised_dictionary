import React, { useState, FormEvent } from 'react';

interface Entry {
  key: string;
  content: string;
}

export default function EntryForm() {
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

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
        setKey('');
        setContent('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setMessage('An error occurred while adding the entry.');
    }
  };

  return (
    <div>
      <h1>JSON Data Store</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="key">Search Key</label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Entry</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}