from celery import Celery
from flask import Flask, jsonify, request

app = Flask(__name__)

# Configure Celery
app.config["CELERY_BROKER_URL"] = "redis://localhost:6379/0"
app.config["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/0"

celery = Celery(app.name, broker=app.config["CELERY_BROKER_URL"])
celery.conf.update(app.config)


@celery.task
def long_task(x, y):
    print(f"Running task with x={x}, y={y}")
    return x + y


@app.route("/add", methods=["POST"])
def add_task():
    print("Received request:", request.json)
    data = request.json
    x = data.get("x")
    y = data.get("y")
    print(f"Values: x={x}, y={y}")
    task = long_task.apply_async(args=[x, y])
    print(f"Task ID: {task.id}")
    return jsonify({"task_id": task.id}), 202


@app.route("/status/<task_id>")
def task_status(task_id):
    task = long_task.AsyncResult(task_id)
    if task.state == "PENDING":
        response = {"state": task.state, "status": "Pending..."}
    elif task.state != "FAILURE":
        response = {"state": task.state, "result": task.result}
    else:
        response = {"state": task.state, "status": str(task.info)}
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
