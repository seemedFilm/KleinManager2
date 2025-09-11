# Use official Python base image
FROM python:3.11-slim

# Copy project files
COPY . /app

#RUN mkdir -p /ads 
#RUN chmod 777 /ads

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Set working directory

WORKDIR /app
# Install debugging tools
# RUN pip install debugpy

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
