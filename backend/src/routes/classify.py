from flask import Blueprint, request, jsonify

from db import generate_random_id, get_db_connection
from ml import classify_image
from user_auth import get_user_id_by_session_id

classify_bp = Blueprint("classify", __name__)

@classify_bp.route("/classify/save-classification", methods=["POST"])
def save_classification_endpoint():
    # Only authenticated users should be saving classifications
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    # Now we have to start using the database
    conn = get_db_connection()

    user_id = get_user_id_by_session_id(conn, session_id)
    if user_id is None:
        return jsonify({"success": False, "error": "Session has expired"}), 400 # Only explanation for a session with no user

    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Validate the data
    if "classification" not in data or "image" not in request.files:
        return jsonify({"error": "Classification and image are required"}), 400

    # Add to the database
    classification_id = generate_random_id(conn, "classifications", "classification_id")
    classification = data["classification"]
    image = data["image"]

    conn.execute("INSERT INTO classifications(classification_id, user_id, classification, image) VALUES(?, ?, ?, ?)", (classification_id,
                                                                                                                        user_id,
                                                                                                                        classification,
                                                                                                                        image))
    conn.commit()
    conn.close()

    return jsonify({"success": True}), 200


@classify_bp.route("/classify/get-classifications", methods=["GET"])
def get_classifications_endpoint():
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    conn = get_db_connection()
    user_id = get_user_id_by_session_id(conn, session_id)
    if user_id is None:
        return jsonify({"success": False, "error": "Session has expired"}), 400

    rows = conn.execute("SELECT * FROM classifications WHERE user_id = ?", (user_id,)).fetchall()
    classifications = [dict(row) for row in rows]
    return jsonify({"success": True, "classifications": classifications}), 200


@classify_bp.route("/classify/classify-rash", methods=["POST"])
def classify_rash_endpoint():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files["image"]
    image_bytes = image.read()

    res = classify_image(image_bytes)
    
    return jsonify({"result": res}), 200