#!/usr/bin/env bash
set -e # halt script on error

if [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${DEPLOY_BRANCH} ]; then
  echo "Deploying to Production server"
  scp -i deploy_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* ranking5@rankingdigitalrights.org:/home4/ranking5/public_html/index2019/
elif [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${DEVELOPMENT_BRANCH} ]; then
  echo "Deploying to Development server"
  scp -P 2202 -i deploy_rsa -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -rp _site/* rdr2019build@cloudtech.company:~/public_html
else
  echo "Not a publishable branch so we're all done here"
fi
