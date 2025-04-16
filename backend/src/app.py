# App definition

from flask import Flask
from src.routes.auth import auth_bp
from src.routes.classify import classify_bp
from src.routes.doctors import doctors_bp
import os
from sqlite3 import connect, Connection, Row

# Used for cryptography
import secrets
import string

app = Flask(__name__)
app.register_blueprint(auth_bp)
app.register_blueprint(classify_bp)
app.register_blueprint(doctors_bp)

DB_PATH = os.getenv("DATABASE_PATH")

def get_db_connection():
    if DB_PATH:
        conn = connect(DB_PATH)
    else:
        raise Exception("DATABASE_PATH environment variable not set")

    conn.row_factory = Row
    return conn


def generate_random_id(conn: Connection, table_name: str, id_name: str, length: int=16) -> str:
    """
    Generates a cryptographically secure, collision-free random ID for a given database table and column.

    Args:
        conn (Connection): An active SQLite database connection object.
        table_name (str): The name of the table where the ID must be unique.
        id_name (str): The name of the column to check for ID uniqueness.
        length (int, optional): The desired length of the ID. Defaults to 16.

    Returns:
        str: A randomly generated ID string that does not currently exist in the specified table and column.

    Notes:
        - Uses a 64-character alphabet (A-Z, a-z, 0-9, "-", "_") for ID generation.
        - Loops until a unique ID is found to avoid collisions.
    """
    alphabet = string.ascii_letters + string.digits + "-_" # Create our set of characters: 64 possible characters
    while True:
        random_id = ''.join(secrets.choice(alphabet) for _ in range(length))
        # Check for collisions in the database
        if conn.execute(f"SELECT EXISTS(SELECT 1 FROM {table_name} WHERE {id_name} = ?)", (random_id,)).fetchone() is 0:
            return random_id