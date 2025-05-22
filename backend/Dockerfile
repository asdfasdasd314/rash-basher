FROM python:3.11-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential gcc libffi-dev libjpeg-dev zlib1g-dev

COPY requirements.txt .

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libffi8 libjpeg62-turbo zlib1g

COPY --from=builder /install /usr/local

COPY src/ .
COPY .env .

COPY models/ ./models/

EXPOSE 8080

CMD ["python", "main.py"]
