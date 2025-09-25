<#
.SYNOPSIS
This script automates the setup and launch of the Zava Model Router Demo.

.DESCRIPTION
The script performs the following actions:
1. Checks for and installs Node.js and Python dependencies.
2. Loads environment variables from a .env file.
3. Starts the backend Python Flask server.
4. Starts the frontend React Vite development server.

.EXAMPLE
.\start-demo.ps1
#>

# --- Configuration ---
$envFile = ".env"
$nodeModulesDir = "node_modules"
$pythonVenvDir = ".venv"

# --- Helper Functions ---
function Check-CommandExists {
    param ($command)
    return (Get-Command $command -ErrorAction SilentlyContinue)
}

# --- Main Logic ---

# 1. Check for .env file
if (-not (Test-Path $envFile)) {
    Write-Host "INFO: .env file not found. Creating from .env.example."
    Copy-Item ".env.example" $envFile
    Write-Warning "ACTION REQUIRED: Please fill in your credentials in the newly created .env file and restart the script."
    exit
}

# 2. Install Dependencies
Write-Host "INFO: Checking dependencies..."

# Check/install Node.js dependencies
if (-not (Test-Path $nodeModulesDir)) {
    Write-Host "INFO: node_modules not found. Running 'npm install'..."
    npm install
} else {
    Write-Host "INFO: node_modules already exists. Skipping 'npm install'."
}

# Check/install Python dependencies

# Handle migration from old 'venv' to new '.venv' directory
if ((Test-Path "venv") -and (-not (Test-Path $pythonVenvDir))) {
    Write-Host "INFO: Found old 'venv' directory. Migrating to '.venv' for consistency with README..."
    try {
        Move-Item "venv" $pythonVenvDir
        Write-Host "INFO: Successfully migrated virtual environment to $pythonVenvDir"
    }
    catch {
        Write-Warning "WARNING: Failed to migrate 'venv' to '$pythonVenvDir'. You may need to manually delete 'venv' and re-run the script."
    }
}

if (-not (Test-Path $pythonVenvDir)) {
    Write-Host "INFO: Python virtual environment not found. Creating and installing requirements..."
    try {
        python -m venv $pythonVenvDir
        if (Test-Path "$pythonVenvDir\Scripts\python.exe") {
            # Use the virtual environment's pip to install packages
            & "$pythonVenvDir\Scripts\python.exe" -m pip install -r requirements.txt
            Write-Host "INFO: Virtual environment created and packages installed successfully."
        } else {
            Write-Warning "WARNING: Virtual environment created but python.exe not found. Installing packages globally."
            pip install -r requirements.txt
        }
    }
    catch {
        Write-Error "ERROR: Failed to create virtual environment. Error: $_"
        Write-Host "INFO: Falling back to global Python installation..."
        pip install -r requirements.txt
    }
} else {
    Write-Host "INFO: Python virtual environment already exists."
    # Check if packages are installed in the virtual environment
    if (Test-Path "$pythonVenvDir\Scripts\python.exe") {
        Write-Host "INFO: Checking if packages are installed..."
        $flaskCheck = & "$pythonVenvDir\Scripts\python.exe" -c "import flask; print('Flask installed')" 2>$null
        if (-not $flaskCheck) {
            Write-Host "INFO: Installing missing packages in virtual environment..."
            & "$pythonVenvDir\Scripts\python.exe" -m pip install -r requirements.txt
        } else {
            Write-Host "INFO: All packages appear to be installed."
        }
    } else {
        Write-Warning "WARNING: Virtual environment exists but python.exe not found."
    }
}


# 3. Start Backend and Frontend Servers
Write-Host "INFO: Starting servers..."

# Prepare Python command with virtual environment
$pythonCmd = if (Test-Path "$pythonVenvDir\Scripts\python.exe") {
    "$pythonVenvDir\Scripts\python.exe"
} else {
    "python"
}

# Start the Python backend in a new window using the virtual environment Python
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)'; & '$pythonCmd' app.py"

# Start the Node frontend in a new window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)'; npm run dev"

Write-Host "SUCCESS: Backend and frontend servers are starting in separate windows."
Write-Host "Your application should be available at http://localhost:5173 shortly."
