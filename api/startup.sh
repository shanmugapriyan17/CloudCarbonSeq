#!/bin/bash
echo "Initiating mandatory CloudCarbonSeq Python boot sequence..."
cd /home/site/wwwroot

# Force install all target requirements into the local user space before binding gunicorn
pip install --user -r requirements.txt

# Bind the backend API directly using the configured Gunicorn driver
gunicorn -c gunicorn.conf.py app:app
