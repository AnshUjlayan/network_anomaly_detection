import os
from datetime import datetime

import psutil
from celery import Celery
from flask import Flask, jsonify, request
from flask_cors import CORS

from utils import get_conclusion, get_data

# -----------------------------------------------------------------------------
# App config, enabling CORS, and creating a Celery instance.
# Examples for the API endpoints are provided as curl commands.

app = Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

celery = Celery(
    "celery",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

if not os.path.exists("dump"):
    os.makedirs("dump")
    os.makedirs("dump/temp")


# -----------------------------------------------------------------------------
# API root to check if the server is running.
# Example: curl http://localhost:8000/


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the Flask server!"}), 200


# -----------------------------------------------------------------------------
# Returns the status and result of a Celery task, by task ID.
# Example: curl http://localhost:8000/task/<task_id>


@app.route("/task/<task_id>", methods=["GET"])
def task_status(task_id):
    task = celery.AsyncResult(task_id)
    return jsonify({"status": task.status, "result": task.result}), 200


# -----------------------------------------------------------------------------
# Lists all the network interfaces available on the system.
# Filters out the interfaces that are not relevant for packet capture.
# Example: curl http://localhost:8000/interfaces


@app.route("/interfaces", methods=["GET"])
def get_interfaces():
    all_interfaces = psutil.net_if_addrs().keys()
    relevant_prefixes = ["en", "eth", "wlan", "utun"]

    relevant_interfaces = [
        interface
        for interface in all_interfaces
        if any(interface.startswith(prefix) for prefix in relevant_prefixes)
    ]

    return jsonify({"interfaces": relevant_interfaces}), 200


# -----------------------------------------------------------------------------
# Lists all the dump files available in the "dumps" directory.
# Example: curl http://localhost:8000/filelist


@app.route("/filelist", methods=["GET"])
def get_files():
    query = request.args.get("query", "").lower()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    sort_by = request.args.get("sort", "timestamp")
    order = request.args.get("order", "desc")

    def get_size(file):
        return os.path.getsize(file)

    def get_human_readable_size(size):
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"
        else:
            return f"{size / (1024 * 1024):.2f} MB"

    dumps = [
        {
            "name": f,
            "timestamp": datetime.fromtimestamp(
                os.path.getmtime(os.path.join("dump", f))
            ),
            "size": get_size(os.path.join("dump", f)),
        }
        for f in os.listdir("dump")
        if os.path.isfile(os.path.join("dump", f)) and f.endswith(".csv")
    ]

    if query:
        dumps = [d for d in dumps if query in d["name"].lower()]

    dumps = sorted(dumps, key=lambda x: x[sort_by], reverse=order == "desc")

    total = (len(dumps) + (limit - 1)) // limit
    start = (page - 1) * limit
    end = start + limit
    paginated_files = dumps[start:end]

    for file in paginated_files:
        file["timestamp"] = file["timestamp"].strftime("%a %b %d %H:%M:%S %Y")
        file["size"] = get_human_readable_size(file["size"])

    return (
        jsonify(
            {
                "total": total,
                "page": page,
                "limit": limit,
                "files": paginated_files,
            }
        ),
        200,
    )


# -----------------------------------------------------------------------------
# Schedules a celery task to create a new TCP dump file using tcpdump.
# The task runs in the background and returns a task ID.
# Takes an optional "overwrite" parameter to overwrite an existing file.
# Example:
# curl -X POST -H "Content-Type: application/json" -d '{
#   "interface": "en0",
#   "duration": 100,
#   "output_file": "data",
#   "overwrite": true
# }' http://localhost:8000/tcpdump


@app.route("/tcpdump", methods=["POST"])
def tcpdump():
    interface = request.json.get("interface", "en0")
    duration = request.json.get("duration", 10)
    output_file = request.json.get("output_file", "data")
    overwrite = request.json.get("overwrite", False)

    output_file = os.path.join("dump", output_file + ".csv")

    if os.path.exists(output_file) and not overwrite:
        return jsonify({"error": "Output file already exists"}), 400

    task = celery.send_task(
        "tasks.create_tcpdump", args=[interface, duration, output_file]
    )

    return jsonify({"task_id": task.id}), 202


# -----------------------------------------------------------------------------
# Returns the chart data for packet rates, latency, and throughput.
# Example:
# curl -X POST -H "Content-Type: application/json" -d '{
#   "file": "data.csv"
# }' http://localhost:8000/analysis


@app.route("/analysis", methods=["POST"])
def analysis():
    file = request.json.get("file", "data.csv")
    file_path = os.path.join("dump", file)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    result = get_data(file_path)
    return jsonify(result), 200


# -----------------------------------------------------------------------------
# Analyzes a dump file and returns the conclusion of the analysis.
# curl -X POST -H "Content-Type: application/json" -d '{
#   "file": "data.csv"
# }' http://localhost:8000/analysis/conclusion


@app.route("/analysis/conclusion", methods=["POST"])
def analysis_conclusion():
    file = request.json.get("file", "data.csv")
    file_path = os.path.join("dump", file)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    result = get_conclusion(file_path)
    result = [
        {"name": key, "value": int(value)}
        for key, value in result.items()
        if value > 0
    ]
    return jsonify(result), 200


# -----------------------------------------------------------------------------


@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files["file"]
    file.save(os.path.join("dump", file.filename))
    return jsonify({"message": "File uploaded successfully"}), 200


# -----------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

# -----------------------------------------------------------------------------
