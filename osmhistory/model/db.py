import sqlite3
import os

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "..", "cache.db"))


def get_connection():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS cached_item (
            objectType TEXT,
            objectId INTEGER,
            objectVersion INTEGER,
            dataFormatVersion INTEGER,
            binaryData BLOB,
            PRIMARY KEY (objectType, objectId, objectVersion, dataFormatVersion)
        )
    ''')
    conn.commit()
    conn.close()


# Initialize DB when the module is imported
init_db()
