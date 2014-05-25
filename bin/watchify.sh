#!/usr/bin/env bash

# This script assumes that watchify is installed globally. To do that execute
# npm install -g watchify

# Three watchify processes are started in the background. Use
# pkill -f watchify or pkill -f "node.*watchify"
# to stop them.

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

watchify \
  --entry iteratorutils.js \
  --outfile browser/dist/fluent-iterators.standalone.js \
  --standalone FluentIterators \
  --verbose \
  &

watchify \
  --entry iteratorutils.js \
  --outfile browser/dist/fluent-iterators.require.js \
  --require ./fluent-iterators \
  --verbose \
  &

watchify \
  --entry browser/test/suite.js \
  --outfile browser/test/browserified_tests.js \
  --external ./fluent-iterators.js \
  --verbose \
  &

popd > /dev/null
