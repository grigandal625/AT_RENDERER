import asyncio
import os
from pathlib import Path
from typing import Dict
from uuid import uuid4

from at_queue.core.exceptions import ATQueueException
from at_queue.core.session import ConnectionParameters
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Query
from fastapi import Request
from fastapi import status
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from uvicorn import Config as UviConfig
from uvicorn import Server

from at_renderer.core.at_renderer import ATRenderer
from at_renderer.web.arguments import get_args
from at_renderer.web.models import ExecMethodResult
from at_renderer.web.models import ExecMetod
from at_renderer.web.models import PageDict


CURRENT_FILE_PATH = Path(__file__).resolve()


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=os.path.join(CURRENT_FILE_PATH.parent, 'frontend/build'))
app.mount("/static", StaticFiles(directory=os.path.join(CURRENT_FILE_PATH.parent,
          "frontend/build/static")), name="static")


# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, auth_token: str, session_id: str, websocket: WebSocket):
        await websocket.accept()
        sessions = self.active_connections.get(auth_token, {})
        sessions[session_id] = websocket
        self.active_connections[auth_token] = sessions

    def disconnect(self, auth_token: str, session_id: str):
        sessions = self.active_connections.get(auth_token, {})
        sessions.pop(session_id, None)
        self.active_connections[auth_token] = sessions

    async def send_message(self, auth_token: str, message: str):
        sessions = self.active_connections.get(auth_token, {})
        for _, websocket in sessions.items():
            await websocket.send_text(message)


manager = ConnectionManager()


class GLOBAL:
    renderer = None


async def get_renderer():
    renderer = GLOBAL.renderer
    if renderer is None:
        connection_parameters = ConnectionParameters(**get_args())
        renderer = ATRenderer(connection_parameters, websocket_manager=manager)
    if not renderer.initialized:
        await renderer.initialize()
    if not renderer.registered:
        await renderer.register()
    GLOBAL.renderer = renderer
    return renderer


@app.websocket("/api/ws/")
async def websocket_endpoint(websocket: WebSocket, auth_token: str = Query(...)):
    session_id = str(uuid4())
    await manager.connect(auth_token, session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(auth_token, session_id)


@app.get("/api/page")
async def page(*, auth_token: str) -> PageDict:
    renderer = await get_renderer()
    try:
        page = renderer.get_page(auth_token=auth_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_425_TOO_EARLY, detail=str(e))
    return page


@app.post('/api/exec_method')
async def exec_method(data: ExecMetod) -> ExecMethodResult:
    renderer = await get_renderer()
    try:
        result = await renderer.exec_external_method(data.component, data.method, data.kwargs, auth_token=data.auth_token)
    except ATQueueException as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.__dict__)
    return {'result': result}


@app.get('/{path:path}')
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


async def main():
    args = get_args()
    renderer = await get_renderer()

    loop = asyncio.get_event_loop()
    renderer_task = None
    if not renderer.started:
        renderer_task = loop.create_task(renderer.start())

    server_host = args.get('server_host', '127.0.0.1')
    server_port = args.get('server_port', 8000)

    if not isinstance(server_port, int):
        server_port = int(server_port)

    # config = Config()
    # config.bind = [f"{server_host}:{server_port}"]
    # loop.create_task(serve(app, config=config))

    config = UviConfig(app, server_host, server_port, loop=loop, ws='websockets')
    server = Server(config=config)
    loop.create_task(server.serve())

    try:
        if not os.path.exists('/var/run/at_renderer/'):
            os.makedirs('/var/run/at_renderer/')

        with open('/var/run/at_renderer/pidfile.pid', 'w') as f:
            f.write(str(os.getpid()))
    except PermissionError:
        pass

    if renderer_task is not None:
        await renderer_task

if __name__ == '__main__':
    asyncio.run(main())
