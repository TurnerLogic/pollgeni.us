# warpspeed.sh
# Commands here will be run each time a pull or push deploy is successfully run.

# Install dependencies.
npm install

# Restart passenger.
touch tmp/restart.txt