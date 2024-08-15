from celery import Celery
from flask import Flask, jsonify

app = Flask(__name__)

celery = Celery(
    "celery", broker="redis://redis:6379/0", backend="redis://redis:6379/0"
)


@app.route("/")
def index():
    return jsonify({"message": "Welcome to the Flask server!"})


@app.route("/task")
def task():
    task = celery.send_task("tasks.add", args=[1, 2])
    return jsonify({"task_id": task.id})


@app.route("/task/<task_id>")
def task_status(task_id):
    task = celery.AsyncResult(task_id)
    return jsonify({"task_status": task.status, "task_result": task.result})


@app.route("/sniffer")
def sniffer():
    task = celery.send_task("tasks.start_sniffer")
    return jsonify({"task_id": task.id})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
