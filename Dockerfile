#FROM python:3.11-slim
FROM docker.io/library/python:3.11-slim

ARG GIT_COMMIT
ARG GIT_DATE
ARG BUILD_DATE
ARG APP_VERSION

ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_DATE=$GIT_DATE
ENV BUILD_DATE=$BUILD_DATE
ENV APP_VERSION=$APP_VERSION

COPY . /app
RUN mkdir -p /app/ads 
#RUN mv "/app/ad_Gameboy Spiele Divers.json" "/app/ads/"
#RUN cp "/app/ads/ad_Gameboy Spiele Divers.json" "/app/ads/ad_Gameboy_Spiele_Divers2.json"
RUN pip install -r /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

WORKDIR /app

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
