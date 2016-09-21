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
