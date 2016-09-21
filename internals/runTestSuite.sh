#! /bin/bash

CMDDIR=${PWD##*/}
COMPOSE_PREFIX=${NPMDIR//-}

function doCleaning () {
  echo
  echo -n 'Stopping and removing old containers... '
  npm run clean &>/dev/null
  echo 'Done.'
  echo
}

echo '--------------------------------'
echo '================================'
echo ' grpc-event-store package tests'
echo '================================'
echo '--------------------------------'
doCleaning
echo
echo '==================================================='
echo 'Unit tests'
echo
docker-compose run development npm run i:unit:tests
echo
echo '==================================================='
