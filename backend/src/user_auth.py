from sqlite3 import Connection
from db import generate_random_id
from argon2 import PasswordHasher
ph = PasswordHasher()

def get_user_by_username(conn: Connection, username: str) -> dict | None:
    """
    On the caller to close the connection
    """
    return conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()


def get_user_id_by_username(conn: Connection, username: str) -> str | None:
    """
    On the caller to close the connection
    """
    row = conn.execute('SELECT user_id FROM users WHERE username = ?', (username,)).fetchone()
    if row is None:
        return None
    return row[0]

def get_user_id_by_session_id(conn: Connection, session_id: str) -> str | None:
    """
    On the caller to close the connection
    """
    # We don't close the connection as it may be used later on
    row = conn.execute('SELECT user_id FROM sessions WHERE session_id = ?', (session_id,)).fetchone()
    if row is None:
        return None
    return row[0]


def get_session_id_by_user_id(conn: Connection, user_id: str) -> str | None:
    """
    On the caller to close the connection
    """
    # We don't close the connection as it may be used later on
    row = conn.execute('SELECT session_id FROM sessions WHERE user_id = ?', (user_id,)).fetchone()
    if row is None:
        return None
    return row[0]


def sign_up(conn: Connection, username: str, password: str, user_id: str):
    """
    On the caller to close the connection
    """
    # Hash passwords to make it secure incase there is a data breach
    salt = generate_random_id(conn, "salts", "salt").encode()
    pw_hash = ph.hash(password=password, salt=salt)
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
    row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if row is None:
        return None

    if not ph.verify(row[2], password):
        return None

    session_id = generate_random_id(conn, "sessions", "session_id")
    conn.execute("INSERT INTO sessions (session_id, user_id) VALUES (?, ?)", (session_id, row[0]))
    conn.commit()
    return session_id


def delete_user(conn: Connection, user_id: str):
    """
    On the caller to close the connection
    """
    conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    conn.commit()
