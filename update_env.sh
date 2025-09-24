#!/bin/bash

ENV_FILE=".env"

# Falls Datei nicht existiert, erstellen
touch "$ENV_FILE"

# Git-Variablen
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_DATE=$(git log -1 --format=%cd --date=iso)
BUILD_DATE=$(date '+%Y-%m-%d %H:%M:%S')
APP_VERSION="v0-$(date '+%S')"
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)


# Funktion: Variable ersetzen oder hinzufügen, Werte in Anführungszeichen
set_or_update() {
    VAR_NAME=$1
    VAR_VALUE=$2
    if grep -q "^$VAR_NAME=" "$ENV_FILE"; then
        # existiert → ersetzen
        sed -i "s|^$VAR_NAME=.*|$VAR_NAME=\"$VAR_VALUE\"|" "$ENV_FILE"
    else
        # existiert nicht → anhängen
        echo "$VAR_NAME=\"$VAR_VALUE\"" >> "$ENV_FILE"
    fi
}

set_or_update "GIT_COMMIT" "$GIT_COMMIT"
set_or_update "GIT_DATE" "$GIT_DATE"
set_or_update "BUILD_DATE" "$BUILD_DATE"
set_or_update "APP_VERSION" "$APP_VERSION"
set_or_update "BRANCH_NAME" "$BRANCH_NAME"

echo "✅ .env aktualisiert: GIT_COMMIT=\"$GIT_COMMIT\", GIT_DATE=\"$GIT_DATE\", BUILD_DATE=\"$BUILD_DATE\", APP_VERSION=\"$APP_VERSION\", BRANCH_NAME=\"$BRANCH_NAME\""