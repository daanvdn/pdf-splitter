#!/bin/bash

# Check if conda environment with name 'pdfsplitter_rest_api' exists
if conda env list | grep -q 'pdfsplitter_rest_api'; then
    echo "Environment 'pdfsplitter_rest_api' already exists."
else
    echo "Environment 'pdfsplitter_rest_api' does not exist. Creating..."
    # Create conda environment from conda_environment.yml
    conda create --name pdfsplitter_rest_api --file src/requirements.txt
fi
#activate conda environment
source activate pdfsplitter_rest_api

# Run pyinstaller
pyinstaller src/rest_api.py --distpath rest_api_dist