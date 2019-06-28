#!/usr/bin/env bash
set -e # halt script on error

if [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "$DEPLOY_BRANCH" ]; then
  echo "Deploying to Production"
  scp -i deploy_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* ${SSH_USER}@${SSH_PATH}
elif [ "$TRAVIS_PULL_REQUEST" = "false" ] && [ "$TRAVIS_BRANCH" = "$STAGING_BRANCH" ]; then
  echo "Deploying to Staging"
  scp -i deploy_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* ${SSH_USER}@${SSH_STG_PATH}
else
  echo "Not a publishable branch so we're all done here"
fi
