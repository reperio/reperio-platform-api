#!/bin/sh

set -e

yarn
node initializeDatabase.js
nodemon index.js