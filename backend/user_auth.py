from sqlite3 import Connection
from app import generate_random_id
from argon2 import PasswordHasher
ph = PasswordHasher()

def get_user_id(conn: Connection, session_id: str) -> str | None:
    """
    On the caller to close the connection
    """
    # We don't close the connection as it may be used later on
    return conn.execute('SELECT user_id FROM sessions WHERE session_id = ?', (session_id,)).fetchone()


def sign_up(conn: Connection, username: str, password: str, user_id: str):
    """
    On the caller to close the connection
    """
    # Hash passwords to make it secure incase there is a data breach
    salt = generate_random_id(conn, "salts", "salt")
    pw_hash = ph.hash(password, salt)
    conn.execute("INSERT INTO users (username, password, user_id) VALUES (?, ?, ?)", (username, pw_hash, user_id))
    conn.commit()
    conn.execute("INSERT INTO salts (salt) VALUES (?)", (salt,))
    conn.commit()


def sign_out(conn: Connection, session_id: str):
    """
    On the caller to close the connection
    """
    conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
    conn.commit()


def sign_in(conn: Connection, username: str, password: str) -> str | None:
    """
    On the caller to close the connection
    """
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if user is None:
        return None

    if not ph.verify(user[2], password):
        return None

    session_id = generate_random_id(conn, "sessions", "session_id")
    conn.execute("INSERT INTO sessions (session_id, user_id) VALUES (?, ?)", (session_id, user[0]))
    conn.commit()
    return session_id


def delete_user(conn: Connection, user_id: str):
    """
    On the caller to close the connection
    """
    conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    conn.commit()
