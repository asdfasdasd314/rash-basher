# App definition

from flask import Flask
from flask_cors import CORS
from routes.classify import classify_bp
from routes.doctors import doctors_bp

app = Flask(__name__)

# We do not need CORS because we are using a mobile app and CORS is not necessary for mobile apps

CORS(app)
app.register_blueprint(classify_bp)
app.register_blueprint(doctors_bp)
