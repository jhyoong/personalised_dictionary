import React from 'react';
import Head from 'next/head';
import EntryForm from '../components/EntryForm';
import SearchComponent from '../components/SearchComponent';

export default function Home() {
  return (
    <>
      <Head>
        <title>JSON Data Store</title>
        <meta name="description" content="Simple JSON data entry and search application" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">JSON Data Store</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border p-4 rounded shadow">
            <h2 className="text-2xl mb-4 font-semibold">Add New Entry</h2>
            <EntryForm />
          </div>
          
          <div className="border p-4 rounded shadow">
            <h2 className="text-2xl mb-4 font-semibold">Search Entries</h2>
            <SearchComponent />
          </div>
        </div>
      </div>
    </>
  );
}