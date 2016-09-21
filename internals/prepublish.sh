#! /bin/bash

echo_fail() {
  echo $1
  exit 1
}

isValidReleaseType () {
  validTypes=("major" "minor" "patch")
  local e
  for e in "${validTypes[@]}"; do [[ $e == $1 ]] && return 1; done
  return 0
}

echo
echo 'Release gRPC Event Store on NPM'
echo
./internals/runTestSuite.sh
./internals/buildPackage.sh
echo
echo 'Type the release type (major || minor || patch)'
read -p "> " RELEASE_TYPE

isValidReleaseType $RELEASE_TYPE
VALID_TYPE=$?

[[ $VALID_TYPE == 1 ]] || echo_fail "Release type not valid"

npm version "$RELEASE_TYPE"
