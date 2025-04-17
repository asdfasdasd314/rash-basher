import string
import secrets
from sqlite3 import connect, Connection, Row

from dotenv import get_key

DB_PATH = get_key(".env", "DATABASE_PATH")

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
        row = conn.execute(f"SELECT 1 FROM {table_name} WHERE {id_name} = ? LIMIT 1", (random_id,)).fetchone()
        if row is None:
            return random_id