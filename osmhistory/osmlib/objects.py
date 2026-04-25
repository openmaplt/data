from datetime import datetime
from itertools import chain

API_NODE_URL = "https://www.openstreetmap.org/api/0.6/node/%d"
API_WAY_URL = "https://www.openstreetmap.org/api/0.6/way/%d"
API_RELATION_URL = "https://www.openstreetmap.org/api/0.6/relation/%d"

OSM_TIME_FORMAT = '%Y-%m-%dT%H:%M:%SZ'


def mergeReferences(refs1, refs2):
    return (refs1[0] + refs2[0],
            refs1[1] + refs2[1],
            refs1[2] + refs2[2])


class Tag(object):
    # Statuses
    SAME = 0
    NEW = 1
    CHANGED = 2
    DELETED = 3

    def __init__(this, key, value, status=SAME):
        this.key = key
        this.value = value
        this.status = status


def getKey(tag):
    return tag.key


class OsmObject(object):
    def parseTags(this, xmlNode):
        tagsList = list()
        for tagNode in xmlNode.getElementsByTagName('tag'):
            key = tagNode.getAttribute('k')
            value = tagNode.getAttribute('v')
            tagsList.append(Tag(key, value))
        this.tagsList = tagsList

    @staticmethod
    def findTagsDiff(tagsOld, tagsNew):
        tagsOldDict = dict()
        oldKeys = set()
        for tag in tagsOld:
            tagsOldDict[tag.key] = tag
            oldKeys.add(tag.key)

        tagsNewDict = dict()
        newKeys = set()
        for tag in tagsNew:
            tagsNewDict[tag.key] = tag
            newKeys.add(tag.key)

        createdKeys = newKeys - oldKeys
        for key in createdKeys:
            tagsNewDict[key].status = Tag.NEW
            tagsOld.append(Tag(key, '[New]', Tag.NEW))

        removedKeys = oldKeys - newKeys
        for key in removedKeys:
            tagsOldDict[key].status = Tag.DELETED
            tagsNew.append(Tag(key, '[Deleted]', Tag.DELETED))

        sameKeys = oldKeys & newKeys
        for key in sameKeys:
            tagOld = tagsOldDict[key]
            tagNew = tagsNewDict[key]
            if tagOld.value != tagNew.value:
                tagOld.status = Tag.CHANGED
                tagNew.status = Tag.CHANGED

        # Sort tags by key
        tagsOld.sort(key=getKey)
        tagsNew.sort(key=getKey)


class Changeset(OsmObject):
    FORMAT_VERSION = 4

    def __init__(this, _id, xmlString=None):
        this._id = _id
        if xmlString:
            this.parse(xmlString)
        this.nodesIndex = dict()
        this.waysIndex = dict()

    def parseInfoDom(this, changesetNode):
        assert changesetNode.tagName == 'changeset', "Invalid tagname: '%s' expected 'changeset'" % changesetNode.tagName
        this.user = changesetNode.getAttribute('user')
        this.uid = int(changesetNode.getAttribute('uid') or '0')
        this.created_at = datetime.strptime(
            changesetNode.getAttribute('created_at'), OSM_TIME_FORMAT)

        closed_at_str = changesetNode.getAttribute('closed_at')
        if closed_at_str == '':  # If changeset isn't closed yet
            this.closed_at = datetime.now()
        else:
            this.closed_at = datetime.strptime(closed_at_str, OSM_TIME_FORMAT)

        this.is_open = (changesetNode.getAttribute('open') == 'true')
        this.min_lat = float(changesetNode.getAttribute('min_lat') or '0')
        this.min_lon = float(changesetNode.getAttribute('min_lon') or '0')
        this.max_lat = float(changesetNode.getAttribute('max_lat') or '0')
        this.max_lon = float(changesetNode.getAttribute('max_lon') or '0')

        this.parseTags(changesetNode)

    def parseDataDom(this, xmlDom):
        this.parseCreated(xmlDom)
        this.parseModified(xmlDom)
        this.parseDeleted(xmlDom)

    def parseCreated(this, xmlDom):
        created = []
        for createNode in xmlDom.getElementsByTagName('create'):
            for childNode in createNode.childNodes:
                if childNode.nodeType == 1:
                    osmObj = this.parseObject(childNode)
                    created.append(osmObj)
        this.created = created

    def parseModified(this, xmlDom):
        modified = []
        for modifyNode in xmlDom.getElementsByTagName('modify'):
            for childNode in modifyNode.childNodes:
                if childNode.nodeType == 1:
                    osmObj = this.parseObject(childNode)
                    modified.append(osmObj)
        this.modified = modified

    def parseDeleted(this, xmlDom):
        deleted = []
        for deleteNode in xmlDom.getElementsByTagName('delete'):
            for childNode in deleteNode.childNodes:
                if childNode.nodeType == 1:
                    osmObj = this.parseObject(childNode)
                    deleted.append(osmObj)
        this.deleted = deleted

    def parseObject(this, xmlDom):
        objectType = xmlDom.tagName
        if objectType == 'node':
            obj = Node(parentChangeset=this)
            obj.parseDom(xmlDom)
            this.nodesIndex[obj._id] = obj
            return obj
        elif objectType == 'way':
            obj = Way(parentChangeset=this)
            obj.parseDom(xmlDom)
            this.waysIndex[obj._id] = obj
            return obj
        elif objectType == 'relation':
            obj = Relation(parentChangeset=this)
            obj.parseDom(xmlDom)
            return obj
        else:
            raise Exception('Unknown object type: "%s"' % objectType)

    def getChildObjects(this):
        return this.created + this.modified + this.deleted

    def getReferences(this):
        references = ([], [], [])
        for osmObject in chain(this.created, this.modified, this.deleted):
            references = mergeReferences(references, osmObject.getReferences())
        return references

    def resolveRefs(this, objectsDict):
        for osmObject in chain(this.created, this.modified, this.deleted):
            osmObject.resolveRefs(objectsDict)


class Node(OsmObject):
    FORMAT_VERSION = 3

    def __init__(this, _id=-1, version=-1, parentChangeset=None):
        # super(Node, this).__init__()
        this.type = 'node'
        this._id = _id
        this.version = version
        this.parentChangeset = parentChangeset

    def getApiUrl(this):
        url = API_NODE_URL % this._id
        if this.version != -1:
            url += '/' + str(this.version)
        return url

    def parseDom(this, xmlDom):
        if not hasattr(this, 'xmlString') or not this.xmlString:
            this.xmlString = xmlDom.toprettyxml(indent='  ')

        this._id = int(xmlDom.getAttribute('id'))
        this.version = int(xmlDom.getAttribute('version'))
        this.lat = float(xmlDom.getAttribute('lat') or '0')
        this.lon = float(xmlDom.getAttribute('lon') or '0')
        this.changeset = int(xmlDom.getAttribute('changeset'))
        this.user = xmlDom.getAttribute('user')
        this.uid = int(xmlDom.getAttribute('uid'))
        this.visible = (xmlDom.getAttribute('visible') == u'true')
        this.timestamp = datetime.strptime(
            xmlDom.getAttribute('timestamp'), OSM_TIME_FORMAT)
        this.parseTags(xmlDom)

    def getReferences(this):
        return ([], [], [])

    def resolveRefs(this, objectsDict):
        pass

    def renderWith(this, renderer, *args, **kwargs):
        return renderer.renderNode(this, *args, **kwargs)


class Way(OsmObject):
    FORMAT_VERSION = 3

    def __init__(this, _id=-1, version=-1, parentChangeset=None):
        # super(Way, this).__init__()
        this.type = 'way'
        this._id = _id
        this.version = version
        this.parentChangeset = parentChangeset

    def getApiUrl(this):
        url = API_WAY_URL % this._id
        if this.version != -1:
            url += '/' + str(this.version)
        return url

    def parseDom(this, xmlDom):
        if not hasattr(this, 'xmlString') or not this.xmlString:
            this.xmlString = xmlDom.toprettyxml(indent='  ')

        this._id = int(xmlDom.getAttribute('id'))
        this.version = int(xmlDom.getAttribute('version'))
        this.changeset = int(xmlDom.getAttribute('changeset'))
        this.user = xmlDom.getAttribute('user')
        this.uid = int(xmlDom.getAttribute('uid'))
        this.visible = (xmlDom.getAttribute('visible') == u'true')
        this.timestamp = datetime.strptime(
            xmlDom.getAttribute('timestamp'), OSM_TIME_FORMAT)
        this.parseTags(xmlDom)
        this.parseNodes(xmlDom)

    def parseNodes(this, xmlDom):
        nodeRefs = []  # list of integers
        for nodeRef in xmlDom.getElementsByTagName('nd'):
            nodeId = int(nodeRef.getAttribute('ref'))
            nodeRefs.append(nodeId)
        this.nodeRefs = nodeRefs

    def getReferences(this):
        return (this.nodeRefs, [], [])

    def resolveRefs(this, objectsDict):
        """ After parsing way it contains only references to nodes.
                This method gets real Node objects from objectsDict. """
        nodes = []
        for nodeId in this.nodeRefs:
            assert nodeId in objectsDict, "Node %d is not found in objectsDict" % nodeId
            nodes.append(objectsDict[nodeId])
        this.nodes = nodes

    def renderWith(this, renderer, *args, **kwargs):
        return renderer.renderWay(this, *args, **kwargs)


class Relation(OsmObject):
    FORMAT_VERSION = 3

    def __init__(this, _id=-1, version=-1, parentChangeset=None):
        # super(Relation, this).__init__()
        this.type = 'relation'
        this._id = _id
        this.version = version
        this.parentChangeset = parentChangeset

    def getApiUrl(this):
        url = API_RELATION_URL % this._id
        if this.version != -1:
            url += '/' + str(this.version)
        return url

    def parseDom(this, xmlDom):
        if not hasattr(this, 'xmlString') or not this.xmlString:
            this.xmlString = xmlDom.toprettyxml(indent='  ')

        this._id = int(xmlDom.getAttribute('id'))
        this.version = int(xmlDom.getAttribute('version'))
        this.changeset = int(xmlDom.getAttribute('changeset'))
        this.user = xmlDom.getAttribute('user')
        this.uid = int(xmlDom.getAttribute('uid'))
        this.visible = (xmlDom.getAttribute('visible') == u'true')
        this.timestamp = datetime.strptime(
            xmlDom.getAttribute('timestamp'), OSM_TIME_FORMAT)
        this.parseTags(xmlDom)
        this.parseMembers(xmlDom)

    def parseMembers(this, xmlDom):
        members = []  # list of Members
        for memberNode in xmlDom.getElementsByTagName('member'):
            memberType = memberNode.getAttribute('type')
            memberRefId = int(memberNode.getAttribute('ref'))
            memberRole = memberNode.getAttribute('role')
            members.append(Member(memberType, memberRefId, memberRole))
        this.members = members

    def getReferences(this):
        nodesRefs = [
            member.refId for member in this.members if member._type == 'node']
        waysRefs = [
            member.refId for member in this.members if member._type == 'way']
        relationsRefs = [
            member.refId for member in this.members if member._type == 'relation']
        return (nodesRefs, waysRefs, relationsRefs)

    def resolveRefs(this, objectsDict):
        nodes = []
        ways = []
        relations = []
        for member in this.members:
            member.object = objectsDict[member.refId]
            if member._type == 'node':
                nodes.append(member.object)
            elif member._type == 'way':
                ways.append(member.object)
            else:
                relations.append(member.object)
        this.nodes = nodes
        this.ways = ways
        this.relations = relations

    def renderWith(this, renderer, *args, **kwargs):
        # raise Exception("relation.renderWith: "+repr(args)+repr(kwargs));
        return renderer.renderRelation(this, *args, **kwargs)


class Member(object):
    def __init__(this, _type=None, refId=None, role=None):
        this._type = _type
        this.refId = refId
        this.role = role
        this.object = None


def test(changesetId):
    changeset = Changeset(changesetId)


if __name__ == '__main__':
    test(11856035)
    print("Done!")
