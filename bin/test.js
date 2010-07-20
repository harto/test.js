#!/bin/bash

ROOT=$(dirname $(dirname $0))

BIN_DIR=${ROOT}/bin
SRC_DIR=${ROOT}/src
LIB_DIR=${ROOT}/lib

if [[ "$1" == "-b" ]]; then
    # include browser environment
    EXTRAS="${LIB_DIR}/env.js"
fi

${BIN_DIR}/js -f ${SRC_DIR}/test.js ${SRC_DIR}/rhino.js ${EXTRAS} $@