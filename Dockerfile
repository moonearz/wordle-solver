FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml ./
COPY src ./src
COPY web ./web

RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "web.app:app"]
