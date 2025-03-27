import React from 'react';
import Head from 'next/head';
import EntryForm from '../components/EntryForm';
import SearchComponent from '../components/SearchComponent';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>JSON Data Store</title>
        <meta name="description" content="Simple JSON data entry and search application" />
      </Head>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">JSON Data Store</h1>
        
        <div className="mb-6">
          <EntryForm />
        </div>

        <div>
          <SearchComponent />
        </div>
      </div>
    </div>
  );
}