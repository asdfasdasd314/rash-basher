from flask import Blueprint, request, jsonify

from ml import classify_image

classify_bp = Blueprint("classify", __name__)

@classify_bp.route("/classify/classify-rash", methods=["POST"])
def classify_rash_endpoint():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files["image"]
    image_bytes = image.read()

    res = classify_image(image_bytes)
    
    return jsonify({"result": res}), 200