from at_queue.core.at_component import ATComponent
from at_queue.core.session import ConnectionParameters
from at_queue.utils.decorators import authorized_method
from typing import Dict, Union, TYPE_CHECKING
from at_renderer.core.types import Page, PageDict
import json

if TYPE_CHECKING:
    from at_renderer.web.server import ConnectionManager

class ATRenderer(ATComponent):
    pages: Dict[str, Page]
    websocket_manager: 'ConnectionManager'

    def __init__(self, connection_parameters: ConnectionParameters, websocket_manager: 'ConnectionManager', *args, **kwargs):
        super().__init__(connection_parameters, *args, **kwargs)
        self.websocket_manager = websocket_manager
        self.pages = {}

    @authorized_method
    async def render_page(self, page: PageDict, auth_token: str) -> None:
        self.pages[auth_token] = Page(**page)
        res = self.pages[auth_token].__dict__
        await self.websocket_manager.send_message(auth_token, json.dumps(res))
        return None

    @authorized_method
    def get_page(self, auth_token: str) -> Union[PageDict, None]:
        page = self.pages.get(auth_token, None)
        if page is None:
            raise ValueError("No such page for token: %s" % auth_token)
        return page.__dict__