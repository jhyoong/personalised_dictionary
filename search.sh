#!/bin/bash

# For macOS - Shebang would most likely need to change to homebrew installed bash(v4+) !/opt/homebrew/bin/bash

# Path to the JSON data store
CURR_PATH="$(realpath $0)"
CURR_DIR="$(dirname ${CURR_PATH})"
DATA_FILE="${CURR_DIR}/data/store.json"
KEY_ADD_SCRIPT="${CURR_DIR}/keyAdd.sh"

# Function to display usage instructions
usage() {
    echo "Usage: ./search.sh [options]"
    echo "Options:"
    echo "  <search_key>              Search for entries by partial, case-insensitive key (default)"
    echo "  -l, --list               List all entries"
    echo "  -a, --add                Add a new key-value pair (calls keyAdd.sh)"
    echo "  -h, --help               Show this help message"
    exit 1
}

# Check if jq is installed (required for JSON parsing)
if ! command -v jq > /dev/null 2>&1; then
    echo "Error: jq is not installed. Please install jq to use this script."
    echo "On Ubuntu/Debian: sudo apt-get install jq"
    echo "On macOS with Homebrew: brew install jq"
    exit 1
fi

# Check if the data file exists
if [ ! -f "$DATA_FILE" ]; then
    echo "Error: Data file $DATA_FILE not found."
    exit 1
fi

# Initialize variables
LIST_ALL=false
SEARCH_KEY=""
CALL_KEY_ADD=false

# Parse command-line arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -l|--list)
            LIST_ALL=true
            shift
            ;;
        -a| --add)
            CALL_KEY_ADD=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            # If it's not a flag, treat it as a search key
            if [ -z "$SEARCH_KEY" ]; then
                SEARCH_KEY="$1"
                shift
            else
                echo "Error: Too many arguments"
                usage
            fi
            ;;
    esac
done

# Function to display search results
display_results() {
    local results="$1"
    if [ -z "$results" ] || [ "$results" = "[]" ]; then
        echo "No matching entries found."
    else
        echo "$results" | jq -r '.[] | "Searched: \(.key)\nModified: \(.modified)\n\(.content)\n"'
    fi
}

# Function to format timestamp (if exists)
format_timestamp() {
    local results="$1"
    if jq -e '.[0].modified' >/dev/null 2>&1 <<< "$results"; then
        # Modified field exists, display it
        echo "$results" | jq -r '.[] | "Searched: \(.key)\nModified: \(.modified)\n\(.content)\n"'
    else
        # Modified field doesn't exist, use original format
        echo "$results" | jq -r '.[] | "Searched: \(.key)\n\(.content)\n"'
    fi
}

# Perform search or list all entries or add key
if [ "$CALL_KEY_ADD" = true ]; then
    bash "$KEY_ADD_SCRIPT"
elif [ "$LIST_ALL" = true ]; then
    results=$(cat "$DATA_FILE")
    format_timestamp "$results"
elif [ -n "$SEARCH_KEY" ]; then
    # Search for entries by partial, case-insensitive key
    results=$(cat "$DATA_FILE" | jq --arg key "${SEARCH_KEY,,}" '[.[] | select(.key | ascii_downcase | contains($key))]')
    format_timestamp "$results"
else
    # No arguments provided
    usage
fi