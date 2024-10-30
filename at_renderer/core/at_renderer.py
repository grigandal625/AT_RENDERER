import json
from typing import Dict
from typing import TYPE_CHECKING
from typing import Union

from at_config.core.at_config_handler import ATComponentConfig
from at_queue.core.at_component import ATComponent
from at_queue.core.session import ConnectionParameters
from at_queue.utils.decorators import authorized_method

from at_renderer.core.types import Page
from at_renderer.core.types import PageDict

if TYPE_CHECKING:
    from at_renderer.web.server import ConnectionManager


class ATRenderer(ATComponent):
    pages: Dict[str, Page]
    websocket_manager: 'ConnectionManager'

    def __init__(self, connection_parameters: ConnectionParameters, websocket_manager: 'ConnectionManager', *args, **kwargs):
        super().__init__(connection_parameters, *args, **kwargs)
        self.websocket_manager = websocket_manager
        self.pages = {}

    async def perform_configurate(self, config: ATComponentConfig, auth_token: str = None, *args, **kwargs) -> bool:
        page_item = config.items.get('page', None)
        if page_item is None:
            raise ValueError("No 'page' item in configuration")
        PageDict(**page_item.data)
        self.pages[auth_token] = Page(**page_item.data)

        res = self.pages[auth_token].__dict__
        await self.websocket_manager.send_message(auth_token, json.dumps(res))

        return True

    async def check_configured(self, *args, auth_token: str = None, **kwargs) -> bool:
        return auth_token in self.pages

    @authorized_method
    async def render_page(self, page: PageDict, auth_token: str) -> bool:
        self.pages[auth_token] = Page(**page)
        res = self.pages[auth_token].__dict__
        await self.websocket_manager.send_message(auth_token, json.dumps(res))
        return True

    @authorized_method
    def get_page(self, auth_token: str) -> Union[PageDict, None]:
        page = self.pages.get(auth_token, None)
        if page is None:
            raise ValueError("No such page for token: %s" % auth_token)
        return page.__dict__

    @authorized_method
    async def show_message(
        self,
        message: str,
        title: str = "",
        message_type: str = "info",
        modal: bool = True,
        auth_token: str = None
    ) -> str:
        await self.websocket_manager.send_message(auth_token, json.dumps(
            {
                'type': 'message',
                'message': message,
                'message_type': message_type,
                'modal': modal
            }
        ))
        return message
