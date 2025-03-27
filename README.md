# personalised_dictionary
Personal project for easy searches through personal notes

A simple Next.js application for adding and managing entries in a JSON file.

## Features
- Add entries with a unique search key
- Update existing entries
- Store data in a local JSON file

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)


# Search Script

## Prerequisites
- Bash
- `jq` (JSON processor)

## Installation
1. Make the script executable:
   ```bash
   chmod +x search.sh
   ```

2. Install jq:
   - Ubuntu/Debian: `sudo apt-get install jq`
   - macOS (Homebrew): `brew install jq`
   - Other systems: Follow jq installation instructions for your OS

## Usage

### Search by Key (Partial, Case-Insensitive)
```bash
./search.sh "search_term"
```

#### Search Behavior
- Matches partial keys
- Case-insensitive
- Returns all entries where the search term is found in the key

### Examples
```bash
# If you have an entry with key "AWS Tester":
./search.sh "aws"      # Will match
./search.sh "TESTER"   # Will match
./search.sh "aws test" # Will match
```

### List All Entries
```bash
./search.sh -l
# or
./search.sh --list
```

### Help
```bash
./search.sh -h
# or
./search.sh --help
```

## Key Changes
- Partial key matching
- Case-insensitive search
- Flexible search across entry keys