#syntax=docker/dockerfile:1.4
# see https://docs.docker.com/build/dockerfile/frontend/#dockerfile-frontend
# see https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/reference.md#syntax
# see https://docs.docker.com/engine/reference/builder/#syntax
#
# SPDX-FileCopyrightText: © Sebastian Thomschke and contributors
# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-ArtifactOfProjectHomePage: https://github.com/Second-Hand-Friends/kleinanzeigen-bot/
#

######################
# runtime image base
######################
FROM debian:stable-slim as runtime-base-image

ARG DEBIAN_FRONTEND=noninteractive
ARG LC_ALL=C

SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

RUN <<EOF

  apt-get update

  echo "#################################################"
  echo "Installing root CAs..."
  echo "#################################################"
  apt-get install --no-install-recommends -y ca-certificates curl
  update-ca-certificates

  echo "#################################################"
  echo "Installing Chromium... & pwuser for starting chromium as non-root user"
  echo "#################################################"
  apt-get install --no-install-recommends -y chromium

  apt-get clean autoclean
  apt-get autoremove --purge -y
  rm -rf \
    /var/cache/{apt,debconf} \
    /var/lib/apt/lists/* \
    /var/log/{apt,alternatives.log,bootstrap.log,dpkg.log} \
    /tmp/* /var/tmp/*

  useradd -ms /bin/bash pwuser 

EOF

# install X11
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    fluxbox \
    novnc \
    websockify \
    nano \
    xterm \
    xfonts-base \
 && rm -rf /var/lib/apt/lists/*


######################
# build image
######################

# https://hub.docker.com/_/python/tags?name=3-slim
FROM python:3.13-slim AS build-image

ARG DEBIAN_FRONTEND=noninteractive
ARG LC_ALL=C

SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

RUN <<EOF

  apt-get update

  # install required libraries
  apt-get install --no-install-recommends -y \
    binutils `# required by pyinstaller` \
    build-essential `# required by transitive dependency "wrapt"` \
    git `# required by pdm to generate app version` \

  # upgrade pip
  python -m pip install --upgrade pip

  # install pdm
  pip install pdm

EOF

ENV PATH="/opt/upx:${PATH}"

COPY . /opt/app/

RUN <<EOF

  cd /opt/app
  ls -la .
  pdm install -v
  ls -la src/kleinanzeigen_bot
  pdm run compile
  ls -l dist

EOF

RUN /opt/app/dist/kleinanzeigen-bot --help


######################
# final image
######################
# Basis-Image laden
FROM runtime-base-image

# Binärdateien/Artefakte vom Build-Image kopieren
COPY --from=build-image /opt/app/dist/kleinanzeigen-bot /opt/kleinanzeigen-bot

# ---- Build Args (werden von update_env.sh gesetzt) ----
ARG BUILD_DATE
ARG GIT_COMMIT_HASH
ARG GIT_COMMIT_DATE
ARG GIT_REPO_URL
ARG KLEINBOT_COOKIE
ARG KLEINBOT_STORAGE

# ---- Labels für Metadaten ----
LABEL maintainer="Sebastian Thomschke" \
  org.label-schema.schema-version="1.0" \
  org.label-schema.build-date=$BUILD_DATE \
  org.label-schema.vcs-ref=$GIT_COMMIT_HASH \
  org.label-schema.vcs-url=$GIT_REPO_URL \
  org.opencontainers.image.authors="Sebastian Thomschke" \
  org.opencontainers.image.vendor="Sebastian Thomschke" \
  org.opencontainers.image.licenses="AGPL-3.0" \
  org.opencontainers.image.title="kleinanzeigen-bot" \
  org.opencontainers.image.description="CLI application to ease publishing of ads to kleinanzeigen.de"

ENV PYTHONUNBUFFERED=1
ENV DISPLAY=":0"
ENV X11_DISPLAY=":0"
#ENV KLEINBOT_NAME="kleinbot"
ENV KLEINBOT_LOGS="./logs"
ENV KLEINBOT_DATA="/klein/bot/data"
#ENV KLEINBOT_COOKIE="kleinanzeigen_cookies.json"
#ENV KLEINBOT_STORAGE="/mnt/data/kleinanzeigen_localstorage.json"
ENV SHARED_ADS="/klein/shared/ads"
ENV SHARED_PIC="/klein/shared/pics"
ENV LOGGING_ENABLE="FALSE"
# ---- Default Configs ----
ENV INIT_SH_FILE='' \
    CONFIG_FILE=/mnt/data/config.yaml

RUN echo 'alias ll="ls -alF"' >> ~/.bashrc
RUN echo 'alias ll="ls -alF"' >> /home/pwuser/.bashrc
RUN echo 'alias start="./opt/run.sh publish"'>> ~/.bashrc
RUN bash


COPY docker/image/run.sh /opt/run.sh
COPY docker/image/start_chromium.sh /opt/start_chromium.sh
RUN chmod +x /opt/start_chromium.sh
#changed for debug purposes
RUN chmod +x /opt/run.sh 



VOLUME /mnt/data
VOLUME /mnt/data/ads
VOLUME /mnt/data/ads/pics
VOLUME /mnt/data/cache

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["\
  Xvfb :0 -screen 0 1280x800x16 & \
  sleep 2 && \
  fluxbox & \
  x11vnc -display :0 -nopw -forever -rfbport 5900 & \
  ln -sf /usr/share/novnc/vnc.html /usr/share/novnc/index.html && \
  websockify --web=/usr/share/novnc/ 6080 localhost:5900 & \
  until xdpyinfo -display :0 >/dev/null 2>&1; do echo 'Warte auf Xvfb...'; sleep 1; done && \
  xterm -display :0 -geometry 120x40+10+10 -fa Monospace -fs 10 & \
  tail -f /dev/null \
"]



