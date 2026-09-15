from flask import Flask, jsonify, request
import os

app = Flask(__name__)

tasks = [
    {
        "id": 1,
        "title": "Learn GitHub Actions",
        "completed": False
    },
    {
        "id": 2,
        "title": "Deploy application to ECS",
        "completed": False
    }
]


@app.route("/")
def home():
    return jsonify({
        "application": "Task Manager API",
        "status": "running",
        "message": "Application is running successfully"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


@app.route("/api/info")
def info():
    return jsonify({
        "application": "Task Manager API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    })


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)


@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()

    if not data or "title" not in data:
        return jsonify({
            "error": "Task title is required"
        }), 400

    new_task = {
        "id": len(tasks) + 1,
        "title": data["title"],
        "completed": False
    }

    tasks.append(new_task)

    return jsonify(new_task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):

    for task in tasks:
        if task["id"] == task_id:

            data = request.get_json() or {}

            if "completed" in data:
                task["completed"] = data["completed"]

            if "title" in data:
                task["title"] = data["title"]

            return jsonify(task)

    return jsonify({
        "error": "Task not found"
    }), 404


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )