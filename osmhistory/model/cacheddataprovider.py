from .db import get_connection
from osmlib.objects import Changeset, Node, Way, Relation, Tag, Member
from model.objectloadingerror import ObjectLoadingError
from model.objectloadinginfo import ObjectLoadingInfo
import zlib
import json
from datetime import datetime


class OsmEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "value": obj.strftime('%Y-%m-%dT%H:%M:%SZ')}
        if isinstance(obj, (Changeset, Node, Way, Relation, Tag, Member, ObjectLoadingError, ObjectLoadingInfo)):
            # We filter out parentChangeset to avoid circular references in JSON
            data = obj.__dict__.copy()
            if 'parentChangeset' in data:
                data['parentChangeset'] = None
            return {"__type__": obj.__class__.__name__, "data": data}
        return super().default(obj)


def osm_hook(dct):
    if "__type__" in dct:
        type_name = dct["__type__"]
        if type_name == "datetime":
            return datetime.strptime(dct["value"], '%Y-%m-%dT%H:%M:%SZ')
        
        data = dct["data"]
        classes = {
            "Changeset": Changeset,
            "Node": Node,
            "Way": Way,
            "Relation": Relation,
            "Tag": Tag,
            "Member": Member,
            "ObjectLoadingError": ObjectLoadingError,
            "ObjectLoadingInfo": ObjectLoadingInfo
        }
        
        if type_name in classes:
            cls = classes[type_name]
            # Create instance without calling __init__ to avoid side effects
            obj = cls.__new__(cls)
            obj.__dict__.update(data)
            return obj
            
    return dct


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
        try:
            decompressed = zlib.decompress(row['binaryData']).decode('utf-8')
            return json.loads(decompressed, object_hook=osm_hook)
        except Exception as e:
            print(f"Error loading from cache: {e}")
            return None
    else:
        return None


def saveObjectToCache(obj, objType, objId, objVersion=-1):
    try:
        json_data = json.dumps(obj, cls=OsmEncoder)
        data = zlib.compress(json_data.encode('utf-8'))
        fmt_version = getFormatVersion(objType)

        conn = get_connection()
        cur = conn.cursor()
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
