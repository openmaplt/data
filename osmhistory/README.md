# OSMHistory

OSMHistory is a dedicated microservice that allows users to view the history and detailed information about OpenStreetMap (OSM) objects, including Changesets, Nodes, Ways, and Relations. 

Originally built on Google App Engine (Python 2.7), it has been completely modernized into a standalone **FastAPI (Python 3)** application that uses a local **SQLite** database for lightning-fast caching to reduce external API requests.

It is designed to smoothly integrate with tools like OpenMap.lt (Patrulis) to provide a deep dive into map edits.

## Features
- Fetches real-time and historical XML data directly from the official OpenStreetMap API.
- Reconstructs object versions and differences automatically.
- Caches large changeset payloads to SQLite (`cache.db`) for rapid loading.
- Asynchronous Background Tasks to fetch massive changesets without blocking the UI.
- Fully containerized using Docker for predictable deployments.

---

## Local Development Setup

To run the application locally on your machine, follow these steps:

### 1. Prerequisites
Ensure you have **Python 3.11+** installed on your system.

### 2. Set Up Virtual Environment
It is highly recommended to isolate your dependencies using a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

### 3. Install Dependencies
Install all required Python packages (FastAPI, Uvicorn, Jinja2, Requests, etc.):
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Start the Uvicorn development server:
```bash
uvicorn main:app --reload --port 8000
```
> The `--reload` flag enables hot-reloading so changes you make to the code apply automatically.

You can now open your browser and navigate to: [http://127.0.0.1:8000](http://127.0.0.1:8000)

*(Hint: Test the system by opening a changeset, for example: `http://127.0.0.1:8000/changeset/11856035`)*

---

## Docker Deployment (Production)

To deploy the application in a production-like containerized environment:

### Build the Docker Image
```bash
docker build -t osmhistory-app .
```

### Run the Docker Container
```bash
docker run -d -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e DB_PATH=/app/data/cache.db \
  --name osmhistory osmhistory-app
```
*(The `-v` flag creates a persistent volume for the SQLite cache database so it survives container restarts).*
