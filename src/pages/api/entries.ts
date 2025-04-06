import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

interface Entry {
  key: string;
  content: string;
  modified: string;
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

async function logEditHistory(oldEntry: Entry | null, newEntry: Entry, oldKey?: string) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const logPath = path.join(dataDir, 'history.log');
    const timestamp = new Date().toISOString();
    let logEntry = '';

    // If oldKey is provided, this is a key edit
    if (oldKey) {
      logEntry = `[${timestamp}] KEY EDIT: "${oldKey}" -> "${newEntry.key}" (previous timestamp: ${oldEntry?.modified})\n`;
    } 
    // If content changed, log content edit
    else if (oldEntry && oldEntry.content !== newEntry.content) {
      logEntry = `[${timestamp}] CONTENT EDIT: Key="${newEntry.key}" (previous timestamp: ${oldEntry.modified})\n`;
      logEntry += `OLD: ${oldEntry.content}\n`;
      logEntry += `NEW: ${newEntry.content}\n`;
      logEntry += `---\n`;
    }

    // Only write to log if there's a change
    if (logEntry) {
      await fs.appendFile(logPath, logEntry, 'utf8');
    }
  } catch (error) {
    console.error('Error logging edit history:', error);
    // Continue execution even if logging fails
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
        const { key, content, oldKey } = req.body;
        // Create current timestamp
        const timestamp = new Date().toISOString();
    
        // Read existing data
        const fileContents = await fs.readFile(filePath, 'utf8');
        let data: Entry[] = JSON.parse(fileContents);
    
        // Handle key edit (when oldKey is provided)
        if (oldKey && oldKey !== key) {
          // Find the old entry
          const oldEntryIndex = data.findIndex(entry => entry.key === oldKey);
          
          if (oldEntryIndex !== -1) {
            const oldEntry = data[oldEntryIndex];
            
            // Check if new key already exists
            const newKeyExists = data.some(entry => entry.key === key);
            if (newKeyExists) {
              return res.status(409).json({ message: 'Key already exists' });
            }
            
            // Create new entry with updated key
            const newEntry = { key, content: oldEntry.content, modified: timestamp };
            
            // Log the key change
            await logEditHistory(oldEntry, newEntry, oldKey);
            
            // Remove old entry and add new one
            data.splice(oldEntryIndex, 1);
            data.push(newEntry);
          } else {
            return res.status(404).json({ message: 'Entry not found' });
          }
        } else {
          // Regular content edit or new entry
          // Check for duplicate key
          const existingEntryIndex = data.findIndex(entry => entry.key === key);
          if (existingEntryIndex !== -1) {
            // This is an update to an existing entry
            const oldEntry = data[existingEntryIndex];
            const newEntry = { key, content, modified: timestamp };
            
            // Log the content change
            await logEditHistory(oldEntry, newEntry);
            
            // Update the entry
            data[existingEntryIndex] = newEntry;
          } else {
            // Add new entry with timestamp
            const newEntry = { key, content, modified: timestamp };
            data.push(newEntry);
            
            // Log new entry (no old entry to compare with)
            await logEditHistory(null, newEntry);
          }
        }
    
        // Write updated data back to file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
        res.status(200).json({ message: 'Entry saved successfully' });
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