#clean up output directories if they exist
#create array of directories
$directories = @("python_dist", "dist", "release", "build")
#loop through the directories and remove them if they exist
foreach ($directory in $directories) {
    if(Test-Path $directory) {
        Remove-Item -Recurse -Force $directory
    }
    else {
        Write-Host "$directory does not exist. No need to remove it"
    }
}
Write-Host "Directories cleaned up"
Write-Host "Building the npm app..."
#build npm production
npm run build:prod

Write-Host "Npm app built successfully"

##Convert python rest_api to exe
Write-Host "Building the python app to an exe file..."
#Manually check that conda-hook.ps1 is part of the environment variable 'path'. Script wil fail otherwise
#execute the conda-hook.ps1 script
. conda-hook.ps1


# Name of the conda environment
$envName = "pdfsplitter_rest_api"

# Check if conda environment with name 'pdfsplitter_rest_api' exists
if ((conda env list) -match 'pdfsplitter_rest_api') {
    Write-Host "Environment 'pdfsplitter_rest_api' already exists."
} else {
    Write-Host "Environment 'pdfsplitter_rest_api' does not exist. Creating..."
    # Create conda environment from conda_environment.yml
    conda env create --file src/conda_environment.yml
}

# Activate conda environment
Write-Host "Activating conda environment 'pdfsplitter_rest_api'..."

# Activate the conda environment
conda activate $envName

# Check if the activation worked
if ($env:CONDA_DEFAULT_ENV -eq $envName) {
    Write-Host "Activation of conda environment '$envName' succeeded."
} else {
    Write-Host "Activation of conda environment '$envName' failed."
}
Write-Host "Running pyinstaller..."
# Run pyinstaller and say yes to all questions
pyinstaller src/rest_api.py --distpath python_dist --noconfirm --onefile

#create dir dist/bin
New-Item -ItemType Directory -Force -Path dist/bin
# copy python_dist/rest_api.exe to dist/bin
Copy-Item python_dist/rest_api.exe dist/bin/rest_api.exe

Write-Host "Python app built successfully"
Write-Host "Building the electron app..."
# Build the electron app
npx electron-builder build --publish=never --win
Write-Host "Electron app built successfully"
Write-Host "Done"
