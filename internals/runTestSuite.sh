#! /bin/bash

CMDDIR=${PWD##*/}
COMPOSE_PREFIX=${NPMDIR//-}

function doCleaning () {
  echo
  echo -n 'Stopping and removing containers... '
  npm run clean &>/dev/null
  echo 'Done.'
  echo
}

echo '---------------------------------------------------'
echo '==================================================='
echo ' grpc-event-store package tests'
echo '==================================================='
echo '---------------------------------------------------'
doCleaning
echo '==================================================='
echo
echo 'Unit tests'
echo
docker-compose run development npm run i:unit:tests
doCleaning
echo '==================================================='
echo
echo 'CockroachDB Backend tests'
echo
echo -n 'Starting a CockroachDB instance... '
docker-compose up -d cockroach &>/dev/null
sleep 4
echo 'Done.'
echo
docker-compose run development npm run i:cockroach:tests
doCleaning
echo '==================================================='
