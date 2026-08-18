from flask import Flask, request, jsonify

app = Flask(__name__)

users = [
    {"id": 1, "name": "John"},
    {"id": 2, "name": "Alice"}
]

# CREATE
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    new_user = {
        "id": len(users) + 1,
        "name": data["name"]
    }

    users.append(new_user)
    return jsonify(new_user), 201


# READ
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify(users)


# READ ONE
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = next((u for u in users if u["id"] == user_id), None)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user)


# UPDATE
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()

    user = next((u for u in users if u["id"] == user_id), None)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    user["name"] = data["name"]

    return jsonify(user)


# DELETE
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = next((u for u in users if u["id"] == user_id), None)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    users.remove(user)

    return jsonify({"message": "User deleted"})


if __name__ == "__main__":
    app.run(debug=True)
