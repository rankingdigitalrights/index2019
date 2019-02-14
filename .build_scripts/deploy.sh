#!/usr/bin/env bash
set -e # halt script on error

if [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${DEPLOY_BRANCH} ]; then
  echo "Deploying to Production"
elif [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${STAGING_BRANCH} ]; then
  echo "Deploying to Staging"
  scp -P 2202 -i deploy_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* rdr2019build@cloudtech.company:~/public_html
else
  echo "Not a publishable branch so we're all done here"
fi
