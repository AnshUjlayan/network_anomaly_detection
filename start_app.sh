#!/bin/bash

# To run the script, execute the following commands:
# chmod +x start_app.sh && ./start_app.sh

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Trap EXIT signal to kill all background processes
trap 'kill $(jobs -p)' EXIT

# Check and install Homebrew (for macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command_exists brew; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Install libomp
    if ! brew list libomp &>/dev/null; then
        echo "Installing libomp..."
        brew install libomp
    fi
fi

# Check and install Redis
if ! command_exists redis-server; then
    echo "Redis not found. Installing Redis..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
    elif command_exists apt-get; then
        sudo apt-get update
        sudo apt-get install -y redis-server
    else
        echo "Unsupported OS for automatic Redis installation. Please install Redis manually."
        exit 1
    fi
fi

# Start Redis server in the background
redis-server &

# Start the client
cd client

# check if node_modules are up to date with package.json
if ! cmp --silent package.json <(cat package.json); then
    echo "Installing dependencies..."
    npm i
else
    echo "Dependencies are up to date."
fi

echo "Starting client..."
npm start &

# Start the server
cd ../server

if [ -d "venv" ]; then
    echo "Virtual environment exists."
else
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Compare pip freeze to requirements.txt
if ! cmp --silent requirements.txt <(pip freeze); then
    #clear all installed packages
    pip freeze | xargs pip uninstall -y
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "Dependencies are up to date."
fi

python app.py &

# Check and install Celery
if ! command_exists celery; then
    echo "Celery not found. Installing Celery..."
    pip install celery
fi

# Start Celery worker
celery -A tasks.celery worker --loglevel=info &

# Wait for all background processes
wait
