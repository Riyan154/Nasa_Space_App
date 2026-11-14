#!/bin/zsh

GAME_FOLDER="${0:A:h}"
GAME_URL="http://127.0.0.1:4173/"
NODE_BIN="/Users/riyan/.nvm/versions/node/v26.13.1/bin/node"
LOG_FILE="/tmp/titan-deep-frontier-server.log"

cd "$GAME_FOLDER" || exit 1

if ! /usr/bin/curl --silent --fail --max-time 2 "$GAME_URL" >/dev/null 2>&1; then
  if [[ ! -x "$NODE_BIN" ]]; then
    NODE_BIN="$(command -v node)"
  fi

  if [[ -z "$NODE_BIN" ]]; then
    echo "Node.js could not be found. Install Node.js, then open this launcher again."
    read "?Press Return to close."
    exit 1
  fi

  /usr/bin/nohup "$NODE_BIN" server.js >"$LOG_FILE" 2>&1 &

  for attempt in {1..20}; do
    /bin/sleep 0.25
    if /usr/bin/curl --silent --fail --max-time 1 "$GAME_URL" >/dev/null 2>&1; then
      break
    fi
  done
fi

if /usr/bin/curl --silent --fail --max-time 2 "$GAME_URL" >/dev/null 2>&1; then
  /usr/bin/open "$GAME_URL"
  echo "TITAN: Deep Frontier is open in your browser."
  echo "You can close this Terminal window."
else
  echo "The game server did not start. Details are in $LOG_FILE"
  read "?Press Return to close."
fi
