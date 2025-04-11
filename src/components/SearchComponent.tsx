import React, { useState } from 'react';
import styles from '../styles/SearchComponent.module.css';

interface Entry {
  key: string;
  content: string;
  modified: string;
}

export default function SearchComponent() {
  const [searchKey, setSearchKey] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for edit functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editMessageType, setEditMessageType] = useState<'success' | 'error' | ''>('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [editKey, setEditKey] = useState('');

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

  const startEditing = (index: number) => {
    setEditIndex(index);
    setEditContent(results[index].content);
    setIsEditing(true);
    setEditMessage('');
    setEditMessageType('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditIndex(null);
    setEditContent('');
    setEditMessage('');
    setEditMessageType('');
  };

  const saveEdit = async () => {
    if (editIndex === null) return;
    
    const entry = results[editIndex];
    setLoading(true);
    
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: entry.key,
          content: editContent
        }),
      });

      if (response.ok) {
        // Update the local results array with the edited content
        const updatedResults = [...results];
        updatedResults[editIndex] = {
          ...entry,
          content: editContent,
          modified: new Date().toISOString() // Optimistic update for UI
        };
        
        setResults(updatedResults);
        setEditMessage('Entry updated successfully!');
        setEditMessageType('success');
        
        // Close edit mode after a short delay
        setTimeout(() => {
          setIsEditing(false);
          setEditIndex(null);
          setEditMessage('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setEditMessage(`Error: ${errorData.message}`);
        setEditMessageType('error');
      }
    } catch (error) {
      setEditMessage('An error occurred while updating the entry.');
      setEditMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const startEditingKey = (index: number) => {
    setEditIndex(index);
    setEditKey(results[index].key);
    setIsEditingKey(true);
    setEditMessage('');
    setEditMessageType('');
  };

  const saveKeyEdit = async () => {
    if (editIndex === null) return;
    
    const entry = results[editIndex];
    const oldKey = entry.key;
    setLoading(true);
    
    try {
      // First fetch the current entry to get its content
      const getResponse = await fetch(`/api/entries?search=${encodeURIComponent(oldKey)}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch entry');
      }
      
      const entries = await getResponse.json();
      const currentEntry = entries.find((e: Entry) => e.key === oldKey);
      
      if (!currentEntry) {
        throw new Error('Entry not found');
      }
      
      // Create new entry with the new key and existing content
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: editKey,
          content: currentEntry.content,
          oldKey: oldKey // This will be used by the API to log the change
        }),
      });
  
      if (response.ok) {
        // Update the local results array with the edited key
        const updatedResults = [...results];
        updatedResults[editIndex] = {
          ...entry,
          key: editKey,
          modified: new Date().toISOString() // Optimistic update for UI
        };
        
        setResults(updatedResults);
        setEditMessage('Key updated successfully!');
        setEditMessageType('success');
        
        // Close edit mode after a short delay
        setTimeout(() => {
          setIsEditingKey(false);
          setEditIndex(null);
          setEditMessage('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setEditMessage(`Error: ${errorData.message}`);
        setEditMessageType('error');
      }
    } catch (error) {
      setEditMessage('An error occurred while updating the key.');
      setEditMessageType('error');
    } finally {
      setLoading(false);
    }
  };
  
  const cancelKeyEditing = () => {
    setIsEditingKey(false);
    setEditIndex(null);
    setEditKey('');
    setEditMessage('');
    setEditMessageType('');
  };

  return (
    <div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Search entries..."
          className={styles.searchInput}
        />
        <button 
          onClick={handleSearch}
          className={styles.searchButton}
          disabled={loading}
        >
          Search
        </button>
      </div>
      
      <button 
        onClick={handleListAll}
        className={styles.listButton}
        disabled={loading}
      >
        List All Entries
      </button>

      {loading && <p className={styles.loadingText}>Loading...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.resultsContainer}>
        {results.length > 0 ? (
          <div className={styles.resultsList}>
            {results.map((entry, index) => (
              <div key={index} className={styles.resultItem}>
                <div className={styles.resultHeader}>
                  <h3 className={styles.resultKey}>Searched: {entry.key}</h3>
                  <div>
                    <button 
                      onClick={() => startEditingKey(index)}
                      className={styles.editButton}
                      disabled={isEditing || isEditingKey}
                    >
                      Edit Key
                    </button>
                    <button 
                      onClick={() => startEditing(index)}
                      className={styles.editButton}
                      disabled={isEditing || isEditingKey}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      Edit Content
                    </button>
                  </div>
                </div>
                
                {isEditing && editIndex === index ? (
                  <div className={styles.editContainer}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className={styles.editTextarea}
                    />
                    <div className={styles.editButtons}>
                      <button 
                        onClick={saveEdit}
                        className={styles.saveButton}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className={styles.cancelButton}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {editMessage && (
                      <div className={`${styles.message} ${
                        editMessageType === 'success' ? styles.success : 
                        editMessageType === 'error' ? styles.error : ''
                      }`}>
                        {editMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  ''
                )}

                {isEditingKey && editIndex === index ? (
                  <div className={styles.editContainer}>
                    <input
                      type="text"
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                      className={styles.input}
                    />
                    <div className={styles.editButtons}>
                      <button 
                        onClick={saveKeyEdit}
                        className={styles.saveButton}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={cancelKeyEditing}
                        className={styles.cancelButton}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {editMessage && (
                      <div className={`${styles.message} ${
                        editMessageType === 'success' ? styles.success : 
                        editMessageType === 'error' ? styles.error : ''
                      }`}>
                        {editMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={styles.resultContent}>{entry.content}</p>
                )}
                
                <p className={styles.resultTime}>Modified: {new Date(entry.modified).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : !loading && !error && (
          <p className={styles.noResults}>No entries found.</p>
        )}
      </div>
    </div>
  );
}