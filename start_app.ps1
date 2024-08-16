# start_app.ps1

# For windows user
#  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#  .\start_app.ps1

# To test....

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check and install Chocolatey (Windows package manager)
if (-not (Test-Command choco)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# Check and install Redis
if (-not (Test-Command redis-server)) {
    Write-Host "Redis not found. Installing Redis..."
    choco install redis-64 -y
}

# Check and install Python
if (-not (Test-Command python)) {
    Write-Host "Python not found. Installing Python..."
    choco install python -y
    refreshenv
}

# Check and install Node.js
if (-not (Test-Command node)) {
    Write-Host "Node.js not found. Installing Node.js..."
    choco install nodejs -y
    refreshenv
}

# Start Redis server in the background
Start-Process redis-server -NoNewWindow

# Start the client
Set-Location -Path "client"
Start-Process powershell -ArgumentList "-Command npm i && npm start" -NoNewWindow

# Start the server
Set-Location -Path "..\server"
if (-not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Start-Process powershell -ArgumentList "-Command python app.py" -NoNewWindow

# Check and install Celery
if (-not (Test-Command celery)) {
    Write-Host "Celery not found. Installing Celery..."
    pip install celery
}

# Start Celery worker
Start-Process powershell -ArgumentList "-Command celery -A tasks.celery worker --loglevel=info" -NoNewWindow

# Keep the script running
Write-Host "All processes started. Press Ctrl+C to exit."
while ($true) { Start-Sleep -Seconds 1 }