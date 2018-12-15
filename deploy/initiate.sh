#!/bin/bash
set -e

### Configuration ###
SERVER=boostkings@boostkings.lol
REMOTE_SCRIPT_PATH=/tmp/deploy-boostkings.sh

### Library ###
function run()
{
  echo "Running: $@"
  "$@"
}

### Automation steps ###
run scp deploy/work.sh $SERVER:$REMOTE_SCRIPT_PATH
echo
echo "---- Running deployment script on remote server ----"
run ssh $SERVER bash $REMOTE_SCRIPT_PATH
