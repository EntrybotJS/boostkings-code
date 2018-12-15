#!/bin/bash
set -e

### Configuration ###
APP_DIR=boostkings-code
GIT_URL=git://github.com/Ezic28/boostkings.lol

### Automation steps ###
set -x

# Pull latest code
cd $APP_DIR
git pull

# Install dependencies
npm install --production
npm prune --production

# Restart app
pm2 restart boostkings