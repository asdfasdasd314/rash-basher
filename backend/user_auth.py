from sqlite3 import Connection

def get_user_id(conn: Connection, session_id: str) -> str | None:
    """
    On the caller to close the connection
    """
    # We don't close the connection as it may be used later on
    return conn.execute('SELECT user_id FROM sessions WHERE session_id = ?', (session_id,)).fetchone()
