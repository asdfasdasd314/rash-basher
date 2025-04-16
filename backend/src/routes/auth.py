from flask import Blueprint, request, jsonify

from backend.src.app import get_db_connection
from backend.src.user_auth import delete_user, get_user_by_username, get_user_id_by_session_id, sign_in, sign_out, sign_up
from argon2 import PasswordHasher

ph = PasswordHasher()
auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/login", methods=["POST"])
def login_endpoint():
    # Get username and password from request
    username = request.json.get("username")
    password = request.json.get("password")

    # Check if username and password are valid
    if not username or not password:
        return jsonify({"message": "Invalid username or password"}), 400

    # Check if we can login
    conn = get_db_connection()
    session_id = sign_in(conn, username, password)
    conn.close()

    if session_id is None:
        return jsonify({"message": "Invalid username or password"}), 400

    # Set the session id as an http only cookie
    response = jsonify({"message": "Login successful", "session_id": session_id})
    response.set_cookie("session_id", session_id, httponly=True, secure=True, samesite="strict")
    return response, 200


@auth_bp.route("/auth/signup", methods=["POST"])
def signup_endpoint():
    # Get username and password from request
    username = request.json.get("username")
    password = request.json.get("password")

    # Check if username and password are valid
    if not username or not password:
        return jsonify({"message": "Invalid username or password"}), 400

    # Check if username already exists
    conn = get_db_connection()
    user = get_user_by_username(conn, username)
    conn.close()

    if user is not None:
        return jsonify({"message": "Username already exists"}), 400

    # Create a new user
    conn = get_db_connection()
    sign_up(conn, username, password)

    # Immediately sign in the user
    session_id = sign_in(conn, username, password)

    conn.close()

    # Set the session id as an http only cookie
    response = jsonify({"message": "Signup successful"})
    response.set_cookie("session_id", session_id, httponly=True, secure=True, samesite="strict")
    return response, 200


@auth_bp.route("/auth/logout", methods=["POST"])
def logout_endpoint():
    # Get the session id from the request
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"message": "Not logged in"}), 400

    # Sign out the user
    conn = get_db_connection()
    sign_out(conn, session_id)
    conn.close()

    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/auth/get-user-id", methods=["GET"])
def get_user_id_endpoint():
    # Get the session id from the request
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"message": "Not logged in"}), 400

    # Get the user id from the session id
    conn = get_db_connection()
    user_id = get_user_id_by_session_id(conn, session_id)
    conn.close()

    return jsonify({"message": "Get user id successful", "user_id": user_id}), 200


@auth_bp.route("/auth/delete-user", methods=["DELETE"])
def delete_user_endpoint():
    # Get the session id from the request
    session_id = request.cookies.get("session_id")
    if session_id is None:
        return jsonify({"message": "Not logged in"}), 400

    # Get the username and password from the request
    username = request.json.get("username")
    password = request.json.get("password")

    # Check if username and password are valid
    if not username or not password:
        return jsonify({"message": "Invalid username or password"}), 400

    conn = get_db_connection()

    # Check if the user exists
    user = get_user_by_username(conn, username)
    if user is None:
        return jsonify({"message": "User not found"}), 400

    # Check the session matches the user
    user_id = get_user_id_by_session_id(conn, session_id)
    if user_id is None or user_id != user["user_id"]:
        return jsonify({"message": "Invalid session"}), 400

    # Check if the password is correct
    if not ph.verify(user["password"], password):
        return jsonify({"message": "Invalid password"}), 400

    # Delete the user
    delete_user(conn, user["user_id"])
    conn.close()

    return jsonify({"message": "User deleted"}), 200
