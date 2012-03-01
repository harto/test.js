#!/bin/bash

RUNNER=rhino

ROOT=$(dirname $(dirname $(realpath $0)))

SRC=$ROOT/src
LIB=$ROOT/lib

if [[ "$1" == "-b" ]]; then
    # include browser environment
    EXTRAS=$LIB/env.js
fi

js -f $SRC/test.js $SRC/$RUNNER.js $EXTRAS $@
