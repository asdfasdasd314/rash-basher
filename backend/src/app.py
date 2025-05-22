# App definition

from flask import Flask
from routes.classify import classify_bp
from routes.doctors import doctors_bp

app = Flask(__name__)

# We do not need CORS because we are using a mobile app and CORS is not necessary for mobile apps
# CORS(app, supports_credentials=True, origins=['http://your-frontend-url'])

app.register_blueprint(classify_bp)
app.register_blueprint(doctors_bp)
