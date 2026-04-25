import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from model.cacheddataprovider import saveObjectToCache, getCachedObject
from osmlib.objects import Node
from datetime import datetime

def test_cache():
    print("Testing JSON cache logic...")
    
    # Create a dummy node
    node = Node(_id=123, version=5)
    node.lat = 54.123
    node.lon = 25.456
    node.timestamp = datetime.now()
    node.tagsList = []
    node.xmlString = "<node id='123' ... />"
    
    print(f"Saving node {node._id} to cache...")
    success = saveObjectToCache(node, 'node', node._id, node.version)
    if not success:
        print("FAILED to save to cache")
        return

    print("Retrieving node from cache...")
    cached_node = getCachedObject('node', node._id, node.version)
    
    if cached_node:
        print("Retrieved successfully!")
        print(f"ID: {cached_node._id} (expected 123)")
        print(f"Version: {cached_node.version} (expected 5)")
        print(f"Timestamp: {cached_node.timestamp}")
        
        if cached_node._id == node._id and cached_node.version == node.version:
            print("CACHE TEST PASSED")
        else:
            print("CACHE DATA MISMATCH")
    else:
        print("FAILED to retrieve from cache")

if __name__ == "__main__":
    test_cache()
