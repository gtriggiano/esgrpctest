#! /bin/bash

# Ensure distribution directory
mkdir lib &>/dev/null

echo 'Build gRPC Event Store for publishing in NPM'
echo
echo 'Clean lib/ directory'
rm -rf lib/*
echo
echo 'Transpile code with Babel'
docker-compose run development npm run i:transpile
