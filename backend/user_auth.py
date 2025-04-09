from sqlite3 import Connection
from argon2 import PasswordHasher

ph = PasswordHasher()

def get_user_id(conn: Connection, session_id: str) -> str | None:
    """
    On the caller to close the connection
    """
    # We don't close the connection as it may be used later on
    return conn.execute('SELECT user_id FROM sessions WHERE session_id = ?', (session_id,)).fetchone()


def create_user(conn: Connection, username: str, password: str, user_id: str):
    """
    On the caller to close the connection
    """
    # Hash passwords to make it secure incase there is a data breach
    pw_hash = ph.hash(password)
    conn.execute("INSERT INTO users WHERE (username, password, user_id) VALUES (?, ?, ?)", (username, pw_hash, user_id,))
    conn.commit()


def validate_login(conn: Connection, username: str, password: str) -> bool:
    pass
