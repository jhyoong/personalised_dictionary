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
                <h3 className={styles.resultKey}>Searched: {entry.key}</h3>
                <p className={styles.resultContent}>{entry.content}</p>
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