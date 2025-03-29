import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

interface Entry {
  key: string;
  content: string;
}

// Ensure that the data directory and store.json file exist
async function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'store.json');
  
  try {
    // Check if data directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      // Create data directory if it doesn't exist
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Check if store.json exists
    try {
      await fs.access(filePath);
    } catch (error) {
      // Create empty store.json if it doesn't exist
      await fs.writeFile(filePath, '[]', 'utf8');
    }
    
    return filePath;
  } catch (error) {
    throw new Error(`Failed to ensure data file: ${(error as Error).message}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure data directory and file exist
    const filePath = await ensureDataFile();

    if (req.method === 'GET') {
      try {
        // Read existing data
        const fileContents = await fs.readFile(filePath, 'utf8');
        let data: Entry[] = JSON.parse(fileContents);

        // Check if there's a search query
        const searchQuery = req.query.search as string;
        
        if (searchQuery) {
          // Perform case-insensitive, partial key matching
          data = data.filter(entry => 
            entry.key.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ message: 'Error reading entries', error: (error as Error).message });
      }
    } else if (req.method === 'POST') {
      try {
        const { key, content } = req.body;

        // Read existing data
        const fileContents = await fs.readFile(filePath, 'utf8');
        let data: Entry[] = JSON.parse(fileContents);

        // Check for duplicate key
        const existingEntryIndex = data.findIndex(entry => entry.key === key);
        if (existingEntryIndex !== -1) {
          // Update existing entry
          data[existingEntryIndex] = { key, content };
        } else {
          // Add new entry
          data.push({ key, content });
        }

        // Write updated data back to file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        res.status(200).json({ message: 'Entry added successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error saving entry', error: (error as Error).message });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
}