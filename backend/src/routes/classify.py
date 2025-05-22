from flask import Blueprint, Response, request, jsonify

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

    files = request.files
    
    if not files:
        return jsonify({"error": "No data provided"}), 400

    # Validate the data
    if not request.form.get('classification') or 'image' not in files:
        return jsonify({"error": "Classification and image are required"}), 400

    # Add to the database
    classification_id = generate_random_id(conn, "classifications", "classification_id")
    classification = request.form.get('classification')
    image_file = files["image"]
    filename = image_file.filename
    data = image_file.stream.read()
    content_type = image_file.content_type

    conn.execute("INSERT INTO classifications(classification_id, user_id, classification, filename, data, content_type) VALUES(?, ?, ?, ?, ?, ?)", (classification_id,
                                                                                                                        user_id,
                                                                                                                        classification,
                                                                                                                        filename,
                                                                                                                        data,
                                                                                                                        content_type))
    conn.commit()
    conn.close()

    return jsonify({"success": True}), 200


@classify_bp.route("/classify/get-classification-ids", methods=["GET"])
def get_classification_ids_endpoint():
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    conn = get_db_connection()
    user_id = get_user_id_by_session_id(conn, session_id)
    if user_id is None:
        return jsonify({"success": False, "error": "Session has expired"}), 400

    rows = conn.execute("SELECT classification_id FROM classifications WHERE user_id = ?", (user_id,)).fetchall()
    classification_ids = [row[0] for row in rows]

    return jsonify({"success": True, "classification_ids": classification_ids}), 200


@classify_bp.route("/classify/get-classification", methods=["GET"])
def get_classification_endpoint():
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    data = request.get_json()
    classification_id = data.get("classification_id")

    conn = get_db_connection()
    user_id = get_user_id_by_session_id(conn, session_id)
    if user_id is None:
        return jsonify({"success": False, "error": "Session has expired"}), 400

    row = conn.execute("SELECT * FROM classifications WHERE classification_id = ? AND user_id = ?", (classification_id, user_id)).fetchone()
    if row is None:
        return jsonify({"success": False, "error": "Classification not found"}), 400

    # We have to format the classification
    disposition = f'inline; filename="{row["filename"]}"'
    classification = dict(row)
    return Response(
        classification["data"],
        mimetype=classification["content_type"],
        headers={
            'Content-Disposition': disposition
        }
    )

@classify_bp.route("/classify/classify-rash", methods=["POST"])
def classify_rash_endpoint():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image = request.files["image"]
        
        # Validate file type
        if not image.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400
            
        # Validate file size (e.g., max 5MB)
        image_bytes = image.read()
        if len(image_bytes) > 5 * 1024 * 1024:  # 5MB in bytes
            return jsonify({"error": "Image too large. Maximum size is 5MB"}), 400

        res = classify_image(image_bytes)
        
        return jsonify({
            "success": True,
            "result": res
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
