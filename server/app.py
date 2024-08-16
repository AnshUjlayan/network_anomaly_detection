import os

import psutil
from celery import Celery
from flask import Flask, jsonify, request
from flask_cors import CORS

# -----------------------------------------------------------------------------
# App config, enabling CORS, and creating a Celery instance
# Examples for the API endpoints are provided as curl commands

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
# API root to check if the server is running
# Example: curl http://localhost:8000/


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the Flask server!"}), 200


# -----------------------------------------------------------------------------
# Returns the status and result of a Celery task, by task ID
# Example: curl http://localhost:8000/task/<task_id>


@app.route("/task/<task_id>", methods=["GET"])
def task_status(task_id):
    task = celery.AsyncResult(task_id)
    return jsonify({"status": task.status, "result": task.result}), 200


# -----------------------------------------------------------------------------
# Lists all the network interfaces available on the system
# Filters out the interfaces that are not relevant for packet capture
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
# Lists all the dump files available in the "dumps" directory
# Example: curl http://localhost:8000/dumps


@app.route("/dumps", methods=["GET"])
def get_dumps():
    dumps = [
        f
        for f in os.listdir("dump")
        if os.path.isfile(os.path.join("dump", f))
    ]
    dumps *= 10
    return jsonify(dumps), 200


# -----------------------------------------------------------------------------
# Schedules a celery task to create a new TCP dump file using tcpdump.
# The task runs in the background and returns a task ID.
# Takes an optional "overwrite" parameter to overwrite an existing file.
# Example:
# curl -X POST -H "Content-Type: application/json" -d '{
#   "interface": "en0",
#   "duration": 10,
#   "output_file": "data",
#   "overwrite": false
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

# -----------------------------------------------------------------------------
