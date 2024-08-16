#!/bin/bash


# To run the script, execute the following commands:
# chmod +x start_app.sh && ./start_app.sh

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

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

# Check and install Celery
if ! command_exists celery; then
    echo "Celery not found. Installing Celery..."
    pip install celery
fi

# Start Redis server in the background
redis-server &

# Start the client
cd client
npm i && npm start &

# Start the server
cd ../server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &

# Start Celery worker
celery -A tasks.celery worker --loglevel=info &

# Wait for all background processes
wait