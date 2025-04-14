# App definition

from flask import Flask, request, jsonify
from user_auth import get_user_id
from ml import classify_image
from maps import find_local_doctors, geocode_address
import os
from sqlite3 import connect, Connection, Row

# Used for cryptography
import secrets
import string

app = Flask(__name__)
DB_PATH = os.getenv("DATABASE_PATH")

def get_db_connetion():
    if DB_PATH:
        conn = connect(DB_PATH)
    else:
        raise Exception("DATABASE_PATH environment variable not set")

    conn.row_factory = Row
    return conn


def generate_random_id(conn: Connection, table_name: str, id_name: str, length: int=16) -> str:
    """
    Generates a cryptographically secure, collision-free random ID for a given database table and column.

    Args:
        conn (Connection): An active SQLite database connection object.
        table_name (str): The name of the table where the ID must be unique.
        id_name (str): The name of the column to check for ID uniqueness.
        length (int, optional): The desired length of the ID. Defaults to 16.

    Returns:
        str: A randomly generated ID string that does not currently exist in the specified table and column.

    Notes:
        - Uses a 64-character alphabet (A-Z, a-z, 0-9, "-", "_") for ID generation.
        - Loops until a unique ID is found to avoid collisions.
    """
    alphabet = string.ascii_letters + string.digits + "-_" # Create our set of characters: 64 possible characters
    while True:
        random_id = ''.join(secrets.choice(alphabet) for _ in range(length))
        # Check for collisions in the database
        if conn.execute(f"SELECT EXISTS(SELECT 1 FROM {table_name} WHERE {id_name} = ?)", (random_id,)).fetchone() is 0:
            return random_id


@app.route("/api/classify-rash", methods=["POST"])
def classify_rash_endpoint():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files["image"]
    image_bytes = image.read()

    res = classify_image(image_bytes)
    
    return jsonify({"result": res}), 200


@app.route("/api/find-doctors", methods=["POST"])
def find_doctors_endpoint():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    # Check if we have coordinates or an address
    if 'latitude' in data and 'longitude' in data:
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
    elif 'address' in data:
        try:
            latitude, longitude = geocode_address(data['address'])
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    else:
        return jsonify({"error": "Either latitude/longitude or address is required"}), 400
        
    try:
        radius = int(data.get('radius', 5000))  # Default 5km radius
        max_results = int(data.get('limit', 10))
        
        doctors = find_local_doctors(latitude, longitude, radius, max_results)
        return jsonify({"doctors": doctors}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/save-classification", methods=["POST"])
def save_classification_endpoint():
    # Only authenticated users should be saving classifications
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    # Now we have to start using the database
    conn = get_db_connetion()

    user_id = get_user_id(conn, session_id)
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


@app.route("/api/get-classifications", methods=["GET"])
def get_classifications_endpoint():
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"success": False, "error": "Not logged in"}), 400

    conn = get_db_connetion()
    user_id = get_user_id(conn, session_id)
    if user_id is None:
        return jsonify({"success": False, "error": "Session has expired"}), 400

    classifications = conn.execute("SELECT * FROM classifications WHERE user_id = ?", (user_id,)).fetchall()
    return jsonify({"success": True, "classifications": classifications}), 200
