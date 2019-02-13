#!/usr/bin/env bash
set -e # halt script on error

# If this is the deploy branch, push it up to gh-pages
if [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = $DEPLOY_BRANCH ]; then
  echo "Deploying"
  scp -P 2202 -i rdr2019build -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* rdr2019build@cloudtech.company:~/public_html
else
  echo "Not a publishable branch so we're all done here"
fi
