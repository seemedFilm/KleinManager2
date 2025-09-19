#!/bin/bash
# -----------------------------------------
# Kopiert die config.yaml in das Mount-Verzeichnis
# -----------------------------------------

# .env Variablen einlesen, alle exportieren
set -o allexport
source .env
set +o allexport

# Pfade
SOURCE_CONFIG="./config.yaml"
TARGET_DIR="${KLEINBOT_DATA}"
TARGET_CONFIG="${TARGET_DIR}/config.yaml"

# Prüfen, ob SOURCE_CONFIG existiert
if [ ! -f "$SOURCE_CONFIG" ]; then
  echo "❌ Fehler: ${SOURCE_CONFIG} existiert nicht!"
  exit 1
fi

# Prüfen, ob TARGET_DIR gesetzt ist
if [ -z "$TARGET_DIR" ]; then
  echo "❌ Fehler: KLEINBOT_DATA ist nicht gesetzt!"
  exit 1
fi

# Verzeichnis erstellen (falls nicht vorhanden)
mkdir -p "$TARGET_DIR"

# Datei kopieren
cp "$SOURCE_CONFIG" "$TARGET_CONFIG"

echo "✅ config.yaml wurde nach ${TARGET_CONFIG} kopiert."
