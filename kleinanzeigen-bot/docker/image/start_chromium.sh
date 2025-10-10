#!/usr/bin/env bash
echo "Deleting old chromium locks..."
rm -rf /mnt/data/cache/Single*
echo "Finished deleting old chromium locks."



if [ ! -d "/mnt/data/cache" ]; then
    echo "ERROR: cache mount missing at /mnt/data/cache"
    echo "Please create and mount a volume at /mnt/data/cache"
    echo "Exiting!"
    exit 1
fi
#  --headless=new \

# Chromium Startparameter (sichtbar, nicht headless)
CHROMIUM_CMD=(
  /usr/bin/chromium
  --no-sandbox
  --disable-dev-shm-usage
  --disable-gpu
  --remote-debugging-port=9222
  --user-data-dir=/mnt/data/cache-tmp
  about:blank
)

# Logging-Optionen
if [ "${LOGGING_ENABLE}" = "TRUE" ]; then
    LOGFILE="/mnt/data/logs/chromium.log"
    mkdir -p /mnt/data/logs
    echo "INFO: Logging enabled. Writing Chromium output to $LOGFILE"
    "${CHROMIUM_CMD[@]}" >/dev/null 2>>"$LOGFILE" &
else
    echo "INFO: Logging disabled. Chromium output will appear in terminal."
    "${CHROMIUM_CMD[@]}" &
fi