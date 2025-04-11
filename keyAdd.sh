#!/bin/bash

# For macOS - Shebang would most likely need to change to homebrew installed bash(v4+) !/opt/homebrew/bin/bash

# Path to the JSON data store
CURR_PATH="$(realpath $0)"
CURR_DIR="$(dirname ${CURR_PATH})"
JSON_FILE="${CURR_DIR}/data/store.json"

# Function to get the current timestamp
get_timestamp() {
    printf "%s.%03dZ\n" "$(date -u +"%Y-%m-%dT%H:%M:%S")" "$(($(date -u +%N) / 1000000))"
}

# Function to check if JSON file exists, if not, create new one
initialize_json_file() {
    if [ ! -f "$JSON_FILE" ]; then
        echo "[]" > "$JSON_FILE"
    fi
}

# Main Logic
initialize_json_file

# Get user input
echo "Enter the key:"
read -r key

# Check if the key already exists in file
key_exists=$(jq ".[] | select(.key == \"$key\")" "$JSON_FILE")

if [ -n "$key_exists" ]; then
    echo "The key already exists. Do you want to edit it? (y/n)"
    read -r proceed

    if [ "$proceed" = "y" ] || [ "$proceed" = "Y" ]; then
        # Display existing content
        existing_content=$(jq -r ".[] | select(.key == \"$key\") | .content" "$JSON_FILE")
        echo "Existing content for the key \"$key\": $existing_content"

        # Get new content
        echo "Enter the new content:"
        read -r new_content

        # Create timestamp
        timestamp=$(get_timestamp)

        # Update JSON store
        jq "(.[] | select(.key == \"$key\") | .content) |= \"$new_content\" | (.[] | select(.key == \"$key\") | .modified) |= \"$timestamp\"" "$JSON_FILE" > tmp.json && mv tmp.json "$JSON_FILE"
        echo "The key \"$key\" has been updated."
    else
        echo "No changes were made."
        exit 0
    fi
else
    # Prompt for content as key doesn't exist
    echo "This key does not exist."
    echo "Enter the content for this new key:"
    read -r content

    # Create timestamp
    timestamp=$(get_timestamp)

    # Update JSON store with new entry
    new_entry=$(jq -n --arg key "$key" --arg content "$content" --arg modified "$timestamp" \
        '{key: $key, content: $content, modified: $modified}')
    jq ". + [$new_entry]" "$JSON_FILE" > tmp.json && mv tmp.json "$JSON_FILE"
    echo "The new key \"$key\" has been added."
fi