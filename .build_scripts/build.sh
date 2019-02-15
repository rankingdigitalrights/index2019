#!/usr/bin/env bash
set -e # halt script on error

if [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${DEPLOY_BRANCH} ]; then
  echo "Building site - Production"
  gulp prod
elif [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${DEVELOPMENT_BRANCH} ]; then
  echo "Building site - Development"
  gulp dev
else
  echo "Not building, so long and thanks for all the fish!"
fi
