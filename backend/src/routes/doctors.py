from flask import Blueprint, request, jsonify
from src.maps import find_local_doctors, geocode_address

doctors_bp = Blueprint("doctors", __name__)

@doctors_bp.route("/doctors/find-doctors", methods=["POST"])
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


