# App definition

from flask import Flask, request, jsonify
from ml import classify_image
from maps import find_local_doctors, geocode_address

app = Flask(__name__)

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
    