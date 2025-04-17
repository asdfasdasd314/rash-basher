# App definition

from flask import Flask
from routes.auth import auth_bp
from routes.classify import classify_bp
from routes.doctors import doctors_bp

app = Flask(__name__)
app.register_blueprint(auth_bp)
app.register_blueprint(classify_bp)
app.register_blueprint(doctors_bp)
