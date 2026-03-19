#!/usr/bin/env bash

case "$1" in
  -frontend|-f)
    echo "Starting frontend..."
    cd frontend
    npm i
    npm run dev
    ;;
  -backend|-b)
    echo "Starting backend..."
    cd backend
    if [ -f .venv/Scripts/activate ]; then
      source .venv/Scripts/activate
    else
      source .venv/bin/activate
    fi
    fastapi dev ./api/main.py
    ;;
  *)
    echo "Usage: ./run.sh -frontend or ./run.sh -backend"
    exit 1
    ;;
esac
