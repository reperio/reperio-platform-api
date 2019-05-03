#!/bin/sh

set -e

yarn
(cd db && node initializeDatabase.js)
nodemon index.js