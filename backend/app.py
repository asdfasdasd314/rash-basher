# App definition

from flask import Flask, request, jsonify
from ml import classify_image

app = Flask(__name__)

@app.route("/api/classify-rash", methods=["POST"])
def classify_rash():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files["image"]
    image_bytes = image.read()

    res = classify_image(image_bytes)
    
    return jsonify({"result": res}), 200