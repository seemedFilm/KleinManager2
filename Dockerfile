#FROM python:3.11-slim
FROM docker.io/library/python:3.11-slim

ARG GIT_COMMIT
ARG GIT_DATE
ARG BUILD_DATE
ARG APP_VERSION
ARG BRANCH_NAME

ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_DATE=$GIT_DATE
ENV BUILD_DATE=$BUILD_DATE
ENV APP_VERSION=$APP_VERSION
ENV BRANCH_NAME=$BRANCH_NAME

COPY . /app
RUN mkdir -p /app/ads
RUN mkdir -p /app/addons/adbuilder
COPY app/addons/adbuilder /app/addons/adbuilder

RUN pip install -r /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt



WORKDIR /app

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
