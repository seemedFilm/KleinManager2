FROM python:3.11-slim



# pkill/pgrep braucht procps (für stop/status)
RUN apt-get update \
 && apt-get install -y --no-install-recommends procps \
 && rm -rf /var/lib/apt/lists/*

 # Install debugging tools
# RUN pip install debugpy

COPY . /app


WORKDIR /app
# Default CMD: falls container direkt starten soll; in compose wir benutzen `tail -f /dev/null`
CMD ["python", "main.py"]
