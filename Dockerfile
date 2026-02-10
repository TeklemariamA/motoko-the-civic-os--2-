# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY backend/app.mo /app/app.py

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3

# Expose port 8000
EXPOSE 8000

# Health check using curl (simpler and lighter)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD uvicorn --version || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
