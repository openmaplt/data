import time
import requests
from xml import dom
from xml.dom.minidom import parseString
from .objects import OsmObject, Changeset, Node, Way, Relation
from datetime import datetime

API_CHANGESET_DATA_URL = "https://www.openstreetmap.org/api/0.6/changeset/%d/download"
API_CHANGESET_INFO_URL = "https://www.openstreetmap.org/api/0.6/changeset/%d"
API_NODE_URL = "https://www.openstreetmap.org/api/0.6/node/%d"
API_NODE_VERSION_URL = "https://www.openstreetmap.org/api/0.6/node/%d/%d"
API_NODE_HISTORY_URL = "https://www.openstreetmap.org/api/0.6/node/%d/history"
API_NODES_LIST_URL = "https://www.openstreetmap.org/api/0.6/nodes?nodes=%s"
API_WAY_URL = "https://www.openstreetmap.org/api/0.6/way/%d/full"
API_WAY_VERSION_URL = "https://www.openstreetmap.org/api/0.6/way/%d/%d"
API_WAY_HISTORY_URL = "https://www.openstreetmap.org/api/0.6/way/%d/history"
API_RELATION_URL = "https://www.openstreetmap.org/api/0.6/relation/%d"
API_RELATION_HISTORY_URL = "https://www.openstreetmap.org/api/0.6/relation/%d/history"
API_RELATION_VERSION_URL = "https://www.openstreetmap.org/api/0.6/relation/%d/%d"


def remove_whilespace_nodes(node, unlink=False):
    """Removes all of the whitespace-only text decendants of a DOM node.

    When creating a DOM from an XML source, XML parsers are required to
    consider several conditions when deciding whether to include
    whitespace-only text nodes. This function ignores all of those
    conditions and removes all whitespace-only text decendants of the
    specified node. If the unlink flag is specified, the removed text
    nodes are unlinked so that their storage can be reclaimed. If the
    specified node is a whitespace-only text node then it is left
    unmodified."""

    remove_list = []
    for child in node.childNodes:
        if child.nodeType == dom.Node.TEXT_NODE and \
           not child.data.strip():
            remove_list.append(child)
        elif child.hasChildNodes():
            remove_whilespace_nodes(child, unlink)
    for node in remove_list:
        node.parentNode.removeChild(node)
        if unlink:
            node.unlink()


class OsmApiClient(object):
    def __init__(this):
        this.initCache()
        this.requestsCount = 0
        this.requestsUrls = []

    def loadXml(this, url):
        this.requestsCount += 1
        this.requestsUrls.append(url)

        try:
            response = requests.get(url, timeout=120)
            response.raise_for_status()
            data = response.content
            xmlDom = parseString(data)
            remove_whilespace_nodes(xmlDom)
        except requests.exceptions.HTTPError as error:
            if error.response.status_code in [403, 404, 410]:
                return None  # object is deleted
            raise error
        except requests.exceptions.RequestException as error:
            # Retry (XXX: looks ugly)
            time.sleep(20)
            response = requests.get(url, timeout=120)
            response.raise_for_status()
            data = response.content
            xmlDom = parseString(data)
            remove_whilespace_nodes(xmlDom)

        return xmlDom

    def initCache(this):
        this._cache = dict()

    def cached(this, objectId, version=-1):
        """return cached object or None"""
        return this._cache.get((objectId, version), None)

    def addToCache(this, osmObject, version=-1):
        """Add object to cache"""
        this._cache[(osmObject._id, version)] = osmObject

    def addAllToCache(this, osmObjectsList):
        """Add multiple objects to cache"""
        for osmObj in osmObjectsList:
            this._cache[(osmObj._id, -1)] = osmObj

    def getPlainCache(this):
        plainCache = dict()
        for key, value in this._cache.items():
            if key[1] == -1:
                plainCache[key[0]] = value
        return plainCache

    def getChangeset(this, changesetId):
        """Get changeset with all dependencies"""
        changeset = this.cached(changesetId)
        if changeset is not None:
            return changeset

        # Load meta info
        print(f"Loading meta info for Changeset {changesetId}...")
        changeset = Changeset(changesetId)
        xmlDom = this.loadXml(API_CHANGESET_INFO_URL % changesetId)
        if xmlDom is None:
            print(f"Failed to load meta info for {changesetId}")
            return None
        changeset.parseInfoDom(xmlDom.getElementsByTagName('changeset')[0])

        # Load data
        print(f"Loading data for Changeset {changesetId}...")
        xmlDom = this.loadXml(API_CHANGESET_DATA_URL % changesetId)
        if xmlDom is None:
            print(f"Failed to load data for {changesetId}")
            return None
        changeset.parseDataDom(xmlDom)

        this.addToCache(changeset)
        this.addAllToCache(changeset.getChildObjects())

        # Resolve all references
        resolvedObjects = dict()
        refNodes, refWays, refRelations = changeset.getReferences()

        total_refs = len(refNodes) + len(refWays) + len(refRelations)
        print(
            f"Resolving {total_refs} references ({
                len(refNodes)} nodes, {
                len(refWays)} ways, {
                len(refRelations)} relations)...")

        for i, nodeId in enumerate(refNodes):
            if i % 100 == 0 and i > 0:
                print(f"  - Resolved {i}/{len(refNodes)} nodes")
            resolvedObjects[nodeId] = this.getNodeVersionByTime(
                nodeId, changeset.closed_at)

        for i, wayId in enumerate(refWays):
            if i % 50 == 0 and i > 0:
                print(f"  - Resolved {i}/{len(refWays)} ways")
            resolvedObjects[wayId] = this.getWayVersionByTime(
                wayId, changeset.closed_at)

        for i, relationId in enumerate(refRelations):
            if i % 10 == 0 and i > 0:
                print(f"  - Resolved {i}/{len(refRelations)} relations")
            resolvedObjects[relationId] = this.getRelation(relationId)

        changeset.resolveRefs(resolvedObjects)

        # Load previous versions of modified objects
        for osmObj in changeset.modified:
            if isinstance(osmObj, Node):
                osmObj.prevVersion = this.getNodeVersionByTime(
                    osmObj._id, changeset.created_at)
            elif isinstance(osmObj, Way):
                osmObj.prevVersion = this.getWayVersionByTime(
                    osmObj._id, changeset.created_at)
            elif isinstance(osmObj, Relation):
                osmObj.prevVersion = this.getRelationVersion(
                    osmObj._id, osmObj.version - 1)
            else:
                raise Exception('Unknown OSM Object:' + repr(osmObj))
            OsmObject.findTagsDiff(
                osmObj.prevVersion.tagsList,
                osmObj.tagsList)

        # Load previous versions of deleted objects
        deletedPrevVersions = []
        print(
            f"Loading previous versions for {len(changeset.deleted)} deleted objects...")
        for osmObj in changeset.deleted:
            prevVersion = None
            if isinstance(osmObj, Node):
                prevVersion = this.getNodeVersion(
                    osmObj._id, osmObj.version - 1)
            elif isinstance(osmObj, Way):
                prevVersion = this.getWayVersion(
                    osmObj._id, osmObj.version - 1)
            elif isinstance(osmObj, Relation):
                prevVersion = this.getRelationVersion(
                    osmObj._id, osmObj.version - 1)
            else:
                raise Exception('Unknown OSM Object:' + repr(osmObj))
            if prevVersion is not None:
                deletedPrevVersions.append(prevVersion)
        changeset.deleted = deletedPrevVersions

        print(f"Successfully loaded and parsed Changeset {changesetId}")
        return changeset

    def getWay(this, wayId):
        way = this.cached(wayId)
        if way is not None:
            return way
        way = Way(wayId)
        xmlDom = this.loadXml(API_WAY_URL % wayId)
        if xmlDom is None:
            # Way is deleted
            # Look for the latest version
            return this.getWayVersionByTime(wayId, datetime.now())

        # parse way
        way.parseDom(xmlDom.getElementsByTagName('way')[0])
        # parse nodes
        nodesDict = dict()
        for nodeDom in xmlDom.getElementsByTagName('node'):
            node = Node()
            node.parseDom(nodeDom)
            nodesDict[node._id] = node
            this.addToCache(node)

        way.resolveRefs(nodesDict)
        this.addToCache(way)
        return way

    def getNode(this, nodeId):
        node = this.cached(nodeId)
        if node is not None:
            return node

        xmlDom = this.loadXml(API_NODE_URL % nodeId)
        if xmlDom is None:
            # Node is deleted
            # Look for the latest version
            return this.getNodeVersionByTime(nodeId, datetime.now())

        node = Node(nodeId)
        node.parseDom(xmlDom.getElementsByTagName('node')[0])
        this.addToCache(node)
        return node

    def getRelation(this, relationId):
        relation = this.cached(relationId)
        if relation is not None:
            return relation

        relation = Relation(relationId)
        xmlDom = this.loadXml(API_RELATION_URL % relationId)
        if xmlDom is None:
            # Relation is deleted
            # Look for the latest version
            return this.getRelationVersionMetaInfo(relationId)

        relation.parseDom(xmlDom.getElementsByTagName('relation')[0])

        # resolve references
        refNodes, refWays, refRelations = relation.getReferences()
        if len(refNodes) > 0:
            # raise "refNodes = ",refNodes
            this.getNodesList(refNodes)
        for wayId in refWays:
            this.getWay(wayId)
        for relationId in refRelations:
            this.getRelation(relationId)

        relation.resolveRefs(this.getPlainCache())

        this.addToCache(relation)
        return relation

    def getWayMetaInfo(this, wayId):
        """ Request only basic way properties: id, version, author, etc. Do not request all nodes data. """
        way = this.cached(wayId)
        if way is not None:
            return way
        way = Way(wayId)
        xmlDom = this.loadXml(API_WAY_URL % wayId)

        if xmlDom is None:
            # Way is deleted
            # Look for the latest version
            return this.getWayVersionByTime(wayId, datetime.now())

        # parse way
        way.parseDom(xmlDom.getElementsByTagName('way')[0])
        return way

    def getRelationMetaInfo(this, relationId):
        relation = this.cached(relationId)
        if relation is not None:
            return relation

        relation = Relation(relationId)
        xmlDom = this.loadXml(API_RELATION_URL % relationId)
        relation.parseDom(xmlDom.getElementsByTagName('relation')[0])
        return relation

    def getRelationVersionMetaInfo(this, relationId, version=-1):
        """ Load relation history and get metainfo by relationId and version.
    version == -1 means that latest version is needed.
    This method is used to get info of deleted relations."""

        relation = Relation(relationId)
        xmlDom = this.loadXml(API_RELATION_HISTORY_URL % relationId)

        relationXmlNode = None
        if version == -1:
            # find latest version in XML
            latestVersion = -1
            for xmlNode in xmlDom.getElementsByTagName('relation'):
                currentVersion = int(xmlNode.getAttribute("version", ""))
                if currentVersion > latestVersion:
                    latestVersion = currentVersion
                    relationXmlNode = xmlNode
        else:
            # find latest version in XML
            for xmlNode in xmlDom.getElementsByTagName('relation'):
                currentVersion = int(xmlNode.getAttribute("version", ""))
                if currentVersion == version:
                    relationXmlNode = xmlNode
                    break

        relation.parseDom(relationXmlNode)
        return relation

    def getNodesList(this, nodesIds):
        if len(nodesIds) > 100:
            nodes = this.getNodesList(
                nodesIds[:100]) + this.getNodesList(nodesIds[100:])
            return nodes

        nodesIds = list(map(str, nodesIds))
        url = API_NODES_LIST_URL % (",".join(nodesIds))
        # raise Exception('url: '+url)
        xmlDom = this.loadXml(url)

        # parse nodes
        nodesList = []
        for nodeDom in xmlDom.getElementsByTagName('node'):
            node = Node()
            node.parseDom(nodeDom)
            nodesList.append(node)
            this.addToCache(node)

        return nodesList

    def getWaysList(this, waysIds):
        raise NotImplemented()

    def getNodeVersion(this, nodeId, version):
        node = this.cached(nodeId, version)
        if node is not None:
            return node

        xmlDom = this.loadXml(API_NODE_VERSION_URL % (nodeId, version))
        node = Node(nodeId, version)
        node.parseDom(xmlDom.getElementsByTagName('node')[0])
        this.addToCache(node, version)
        return node

    def getNodeVersionByTime(this, nodeId, timestamp):
        xmlDom = this.loadXml(API_NODE_HISTORY_URL % nodeId)
        nodes = []
        for nodeXml in xmlDom.getElementsByTagName('node'):
            node = Node(nodeId)
            node.parseDom(nodeXml)
            nodes.append(node)

        foundNode = nodes[0]
        # Now find node with node.timestamp <= timestamp
        for node in nodes:
            if node.version > foundNode.version and node.timestamp < timestamp:
                foundNode = node
        return foundNode

    def getWayVersion(this, wayId, version):
        way = this.cached(wayId, version)
        if way is not None:
            return way

        xmlDom = this.loadXml(API_WAY_VERSION_URL % (wayId, version))
        way = Way(wayId, version)
        # parse way
        way.parseDom(xmlDom.getElementsByTagName('way')[0])

        # now we have to load all nodes at way.timestamp
        nodeRefs, wayRefs, relationRefs = way.getReferences()
        nodesDict = dict()
        for nodeId in nodeRefs:
            node = this.getNodeVersionByTime(nodeId, way.timestamp)
            nodesDict[nodeId] = node

        way.resolveRefs(nodesDict)
        this.addToCache(way, version)
        return way

    def getWayVersionByTime(this, wayId, timestamp):
        xmlDom = this.loadXml(API_WAY_HISTORY_URL % wayId)
        ways = []
        for wayXml in xmlDom.getElementsByTagName('way'):
            way = Way(wayId)
            way.parseDom(wayXml)
            ways.append(way)

        foundWay = ways[0]
        # Now find way with way.timestamp <= timestamp
        for way in ways:
            if way.version > foundWay.version and way.timestamp < timestamp:
                foundWay = way

        # now we have to load all nodes at way.timestamp
        nodeRefs, wayRefs, relationRefs = foundWay.getReferences()
        nodesDict = dict()
        for nodeId in nodeRefs:
            node = this.getNodeVersionByTime(nodeId, timestamp)
            nodesDict[nodeId] = node

        foundWay.resolveRefs(nodesDict)
        this.addToCache(foundWay, foundWay.version)
        return foundWay

    def getRelationVersion(this, relationId, version):
        relation = this.cached(relationId, version)
        if relation is not None:
            return relation

        xmlDom = this.loadXml(API_RELATION_VERSION_URL % (relationId, version))
        relation = Relation(relationId, version)
        # parse relation
        relation.parseDom(xmlDom.getElementsByTagName('relation')[0])
        # raise Exception("relation has %d members "%len(relation.members))

        # now we have to load all ways and nodes at relation.timestamp
        nodeRefs, wayRefs, relationRefs = relation.getReferences()
        objectsDict = dict()
        for nodeId in nodeRefs:
            node = this.getNodeVersionByTime(nodeId, relation.timestamp)
            objectsDict[nodeId] = node
        for wayId in wayRefs:
            way = this.getWayVersionByTime(wayId, relation.timestamp)
            objectsDict[wayId] = way

        relation.resolveRefs(objectsDict)
        this.addToCache(relation, version)
        return relation


def test(changesetId):
    client = OsmApiClient()
    changeset = client.getChangeset(11856035)
    print("Created %d objects" % len(changeset.created))
    print("Modified %d objects" % len(changeset.modified))
    print("Deleted %d objects" % len(changeset.deleted))

    modifiedWay = client.cached(129102874)
    print(
        "Way 129102874: %d refs, %d nodes" %
        (len(
            modifiedWay.nodeRefs), len(
            modifiedWay.nodes)))

    prevWay = client.getWayVersion(129102874, modifiedWay.version - 1)
    print("Prev way version: %d refs, %d nodes" %
          (len(prevWay.nodeRefs), len(prevWay.nodes)))


if __name__ == '__main__':
    test(11856035)
    print("Done!")
