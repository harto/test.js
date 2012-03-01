#!/bin/bash

BIN=$(dirname $(realpath $0))
TEST=$(dirname $BIN)/test

#jslint src/*.js
$BIN/test.sh $TEST/test-test.js
