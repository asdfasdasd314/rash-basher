# Stage 1: Build stage
FROM python:3.10-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential gcc
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
COPY models/ ./models/

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt \
 && find /install -name '*.dist-info' -exec rm -rf {} + \
 && find /install -name '__pycache__' -exec rm -rf {} +

# Stage 2: Runtime stage
FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ .
COPY .env .

EXPOSE 8080

CMD ["python", "main.py"]
