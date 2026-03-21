from .db import get_connection
from osmlib.objects import Changeset, Node, Way, Relation
import zlib
import pickle


def getFormatVersion(objType):
    if objType == 'changeset':
        return Changeset.FORMAT_VERSION
    elif objType == 'node':
        return Node.FORMAT_VERSION
    elif objType == 'way':
        return Way.FORMAT_VERSION
    elif objType == 'relation':
        return Relation.FORMAT_VERSION
    return 1


def getCachedObject(objType, objId, objVersion=-1):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT binaryData FROM cached_item
        WHERE objectType = ? AND objectId = ? AND objectVersion = ? AND dataFormatVersion = ?
    ''', (objType, objId, objVersion, getFormatVersion(objType)))

    row = cur.fetchone()
    conn.close()

    if row:
        return pickle.loads(zlib.decompress(row['binaryData']))
    else:
        return None


def saveObjectToCache(obj, objType, objId, objVersion=-1):
    data = zlib.compress(pickle.dumps(obj))
    fmt_version = getFormatVersion(objType)

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute('''
            INSERT OR REPLACE INTO cached_item
            (objectType, objectId, objectVersion, dataFormatVersion, binaryData)
            VALUES (?, ?, ?, ?, ?)
        ''', (objType, objId, objVersion, fmt_version, data))
        conn.commit()
    except Exception as e:
        print(f"Error saving to cache: {e}")
        return False
    finally:
        conn.close()

    return True
