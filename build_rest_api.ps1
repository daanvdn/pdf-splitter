#make sure conda-hook.ps1 on the path
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

# Run pyinstaller
pyinstaller src/rest_api.py --distpath python_dist

#create dir dist/bin
New-Item -ItemType Directory -Force -Path dist/bin
# copy python_dist/rest_api.exe to dist/bin
Copy-Item python_dist/rest_api/rest_api.exe dist/bin/rest_api.exe

