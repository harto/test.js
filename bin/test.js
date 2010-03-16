#!/bin/bash

BIN_DIR=$(dirname $0)
SRC_DIR=$(dirname $BIN_DIR)/src

$BIN_DIR/js -f $SRC_DIR/test.js $SRC_DIR/rhino-test-runner.js $@