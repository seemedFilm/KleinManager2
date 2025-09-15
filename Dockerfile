# Use official Python base image
FROM python:3.11-slim

# pass git infos as build args
ARG GIT_COMMIT
ARG GIT_DATE
ARG BUILD_DATE

ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_DATE=$GIT_DATE
ENV BUILD_DATE=$BUILD_DATE

# Copy project files
COPY . /app

#RUN mkdir -p /ads 
#RUN chmod 777 /ads

# Install dependencies
RUN pip install -r /app/requirements.txt

#RUN pip install --no-cache-dir -r /app/requirements.txt

# Set working directory

WORKDIR /app
# Install debugging tools
#RUN pip install debugpy

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
