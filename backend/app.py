# App definition

from flask import Flask, request, jsonify
from ml import classify_image
from doctors import find_doctors

app = Flask(__name__)

@app.route("/api/classify-rash", methods=["POST"])
def classify_rash():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files["image"]
    image_bytes = image.read()

    res = classify_image(image_bytes)
    
    return jsonify({"result": res}), 200


@app.route("/api/find-doctors", methods=["POST"])
def find_doctors_endpoint():
    data = request.get_json()
    
    if not data or 'location' not in data:
        return jsonify({"error": "Location is required"}), 400
        
    try:
        location = data['location']
        limit = data.get('limit', 10)
        
        doctors = find_doctors(location, limit)
        return jsonify({"doctors": doctors}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    