from flask import Blueprint, request, jsonify
from ml import classify_image

classify_bp = Blueprint("classify", __name__)

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
