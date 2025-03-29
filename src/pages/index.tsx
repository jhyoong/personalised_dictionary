import React from 'react';
import Head from 'next/head';
import EntryForm from '../components/EntryForm';
import SearchComponent from '../components/SearchComponent';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>JSON Data Store</title>
        <meta name="description" content="Simple JSON data entry and search application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>JSON Data Store</h1>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Add New Entry</h2>
            <EntryForm />
          </div>
          
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Search Entries</h2>
            <SearchComponent />
          </div>
        </div>
      </div>
    </>
  );
}