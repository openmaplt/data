from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import jinja2
import os
import traceback
from time import time

from osmlib.api import OsmApiClient
from objectrenderer import ObjectRenderer
from model.cacheddataprovider import getCachedObject, saveObjectToCache
from model import ObjectLoadingError, ObjectLoadingInfo

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    autoescape=jinja2.select_autoescape(['html', 'xml']))

# --- Background Task Workers ---


def load_changeset_task(changesetId: int):
    try:
        print(
            f"--- Started background task to load Changeset {changesetId} ---")
        client = OsmApiClient()
        changeset = client.getChangeset(changesetId)
        saveObjectToCache(changeset, "changeset", changesetId)
        print(
            f"--- Finished loading Changeset {changesetId} and saved to cache ---")
    except Exception as e:
        print(f"--- Error loading Changeset {changesetId}: {e} ---")
        errorObj = ObjectLoadingError(str(e), traceback.format_exc(limit=20))
        saveObjectToCache(errorObj, "changeset", changesetId)


def load_way_version_task(wayId: int, wayVersion: int):
    try:
        client = OsmApiClient()
        way = client.getWayVersion(wayId, wayVersion)
        saveObjectToCache(way, "way", wayId, wayVersion)
    except Exception as e:
        errorObj = ObjectLoadingError(str(e), traceback.format_exc(limit=20))
        saveObjectToCache(errorObj, "way", wayId, wayVersion)


def load_relation_version_task(relId: int, relVersion: int):
    try:
        client = OsmApiClient()
        relation = client.getRelationVersion(relId, relVersion)
        saveObjectToCache(relation, "relation", relId, relVersion)
    except Exception as e:
        errorObj = ObjectLoadingError(str(e), traceback.format_exc(limit=20))
        saveObjectToCache(errorObj, "relation", relId, relVersion)

# --- Routes ---


@app.get("/", response_class=HTMLResponse)
async def main_page():
    template = jinja_environment.get_template('template/main.html')
    return template.render({})


@app.get("/help", response_class=HTMLResponse)
async def help_page():
    template = jinja_environment.get_template('template/help.html')
    return template.render({})


@app.get("/changeset/{changesetId}", response_class=HTMLResponse)
async def changeset_details(
        changesetId: int,
        background_tasks: BackgroundTasks):
    client = OsmApiClient()
    changeset = getCachedObject("changeset", changesetId, -1)

    if changeset is None:
        saveObjectToCache(ObjectLoadingInfo(time()), "changeset", changesetId)
        background_tasks.add_task(load_changeset_task, changesetId)
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId})

    elif isinstance(changeset, ObjectLoadingInfo):
        # Jei krovimas užstrigo ilgiau nei 1 valandą (pvz. restartavus
        # serverį), bandome iš naujo
        if time() - changeset.startTime > 3600:
            saveObjectToCache(
                ObjectLoadingInfo(
                    time()),
                "changeset",
                changesetId)
            background_tasks.add_task(load_changeset_task, changesetId)

        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId})

    elif isinstance(changeset, ObjectLoadingError):
        template = jinja_environment.get_template(
            'template/loadingerrorpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId, 'error': changeset})

    else:
        template = jinja_environment.get_template('template/changeset.html')
        return template.render(
            {'changeset': changeset, 'renderer': ObjectRenderer, 'client': client})


@app.get("/changeset/{changesetId}/map", response_class=HTMLResponse)
async def changeset_map(changesetId: int, background_tasks: BackgroundTasks):
    client = OsmApiClient()
    changeset = getCachedObject("changeset", changesetId, -1)

    if changeset is None:
        saveObjectToCache(ObjectLoadingInfo(time()), "changeset", changesetId)
        background_tasks.add_task(load_changeset_task, changesetId)
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId})

    elif isinstance(changeset, ObjectLoadingInfo):
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId})

    elif isinstance(changeset, ObjectLoadingError):
        template = jinja_environment.get_template(
            'template/loadingerrorpage.html')
        return template.render(
            {'objectType': 'Changeset', 'objectId': changesetId, 'error': changeset})

    else:
        template = jinja_environment.get_template(
            'template/changeset_map.html')
        return template.render(
            {'changeset': changeset, 'renderer': ObjectRenderer, 'client': client})


@app.get("/node/{nodeId}", response_class=HTMLResponse)
async def node_page(nodeId: int):
    client = OsmApiClient()
    start = time()
    node = client.getNode(nodeId)
    finish = time()
    template = jinja_environment.get_template('template/node/info.html')
    return template.render({'node': node,
                            'maxVersion': node.version,
                            'renderer': ObjectRenderer,
                            'client': client,
                            'elapsedTime': (finish - start)})


@app.get("/node/{nodeId}/{nodeVersion}", response_class=HTMLResponse)
async def node_version_page(nodeId: int, nodeVersion: int):
    client = OsmApiClient()
    start = time()
    nodeLatest = client.getNode(nodeId)
    node = client.getNodeVersion(nodeId, nodeVersion)
    finish = time()
    template = jinja_environment.get_template('template/node/info.html')
    return template.render({'node': node,
                            'maxVersion': nodeLatest.version,
                            'renderer': ObjectRenderer,
                            'client': client,
                            'elapsedTime': (finish - start)})


@app.get("/way/{wayId}", response_class=HTMLResponse)
async def way_page(wayId: int):
    client = OsmApiClient()
    start = time()
    way = client.getWay(wayId)
    finish = time()
    template = jinja_environment.get_template('template/way/info.html')
    return template.render({'way': way,
                            'maxVersion': way.version,
                            'renderer': ObjectRenderer,
                            'client': client,
                            'elapsedTime': (finish - start)})


@app.get("/way/{wayId}/{wayVersion}", response_class=HTMLResponse)
async def way_version_page(
        wayId: int,
        wayVersion: int,
        background_tasks: BackgroundTasks):
    client = OsmApiClient()
    way = getCachedObject("way", wayId, wayVersion)

    if way is None:
        saveObjectToCache(ObjectLoadingInfo(time()), "way", wayId, wayVersion)
        background_tasks.add_task(load_way_version_task, wayId, wayVersion)
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render({'objectType': 'Way', 'objectId': wayId})

    elif isinstance(way, ObjectLoadingInfo):
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render({'objectType': 'Way', 'objectId': wayId})

    elif isinstance(way, ObjectLoadingError):
        template = jinja_environment.get_template(
            'template/loadingerrorpage.html')
        return template.render(
            {'objectType': 'Way', 'objectId': wayId, 'error': way})

    else:
        wayLatest = client.getWayMetaInfo(wayId)
        template = jinja_environment.get_template('template/way/info.html')
        return template.render({'way': way,
                                'maxVersion': wayLatest.version,
                                'renderer': ObjectRenderer,
                                'client': client})


@app.get("/relation/{relationId}", response_class=HTMLResponse)
async def relation_page(relationId: int):
    client = OsmApiClient()
    start = time()
    relation = client.getRelation(relationId)
    finish = time()
    template = jinja_environment.get_template('template/relation/info.html')
    return template.render({'relation': relation,
                            'maxVersion': relation.version,
                            'renderer': ObjectRenderer,
                            'client': client,
                            'elapsedTime': (finish - start)})


@app.get("/relation/{relationId}/{relationVersion}",
         response_class=HTMLResponse)
async def relation_version_page(
        relationId: int,
        relationVersion: int,
        background_tasks: BackgroundTasks):
    client = OsmApiClient()
    relation = getCachedObject("relation", relationId, relationVersion)

    if relation is None:
        saveObjectToCache(
            ObjectLoadingInfo(
                time()),
            "relation",
            relationId,
            relationVersion)
        background_tasks.add_task(
            load_relation_version_task,
            relationId,
            relationVersion)
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Relation', 'objectId': relationId})

    elif isinstance(relation, ObjectLoadingInfo):
        template = jinja_environment.get_template('template/loadingpage.html')
        return template.render(
            {'objectType': 'Relation', 'objectId': relationId})

    elif isinstance(relation, ObjectLoadingError):
        template = jinja_environment.get_template(
            'template/loadingerrorpage.html')
        return template.render(
            {'objectType': 'Relation', 'objectId': relationId, 'error': relation})

    else:
        relationLatest = client.getRelationMetaInfo(relationId)
        template = jinja_environment.get_template(
            'template/relation/info.html')
        return template.render({'relation': relation,
                                'maxVersion': relationLatest.version,
                                'renderer': ObjectRenderer,
                                'client': client})
