FROM python:3.11-slim

WORKDIR /app

# pkill/pgrep braucht procps (für stop/status)
RUN apt-get update \
 && apt-get install -y --no-install-recommends procps \
 && rm -rf /var/lib/apt/lists/*


COPY . /app

# Default CMD: falls container direkt starten soll; in compose wir benutzen `tail -f /dev/null`
CMD ["python", "main.py"]
