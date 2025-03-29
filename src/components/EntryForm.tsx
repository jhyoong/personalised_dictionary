import React, { useState, FormEvent } from 'react';
import styles from '../styles/EntryForm.module.css';

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
        <div className={styles.formGroup}>
          <label htmlFor="key">
            Search Key
          </label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        <button 
          type="submit"
          className={styles.button}
        >
          Add Entry
        </button>
      </form>
      
      {message && (
        <div className={`${styles.message} ${
          messageType === 'success' ? styles.success : 
          messageType === 'error' ? styles.error : ''
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}