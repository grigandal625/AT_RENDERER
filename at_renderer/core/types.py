from dataclasses import dataclass
from typing import Any, Optional, NotRequired
from typing import List
from typing import TypedDict
from typing import Union


@dataclass
class Col:
    src: str
    frame_id: str
    props: Any = None


@dataclass
class Row:
    cols: List[Col]
    props: Any = None


@dataclass
class Grid:
    rows: List[Row]


@dataclass
class Link:
    type: str
    href: str
    label: str
    props: Any = None


@dataclass
class Fetch:
    type: str
    url: str
    label: str
    options: Any = None
    framedata_field: Optional[str] = None
    props: Any = None


@dataclass
class ComponentMethod:
    type: str
    label: str
    component: str
    method: str
    framedata_field: Optional[str] = None
    kwargs: Any = None
    props: Optional[dict] = None


@dataclass
class Panel:
    label: str
    links: List[Union[Link, Fetch, ComponentMethod]]
    subtitle: Optional[str] = None


@dataclass
class HandlerFetch:
    type: str
    frame_id: str
    test: str
    url: str
    options: Any = None
    framedata_field: Optional[str] = None
    props: Any = None


@dataclass
class HandlerComponentMethod:
    type: str
    frame_id: str
    test: str
    component: str
    method: str
    framedata_field: Optional[str] = None
    kwargs: Any = None
    props: Optional[dict] = None


@dataclass
class Page:
    grid: Grid
    header: Optional[Panel] = None
    control: Optional[Panel] = None
    footer: Optional[Panel] = None
    handlers: Union[List[Union[HandlerFetch, HandlerComponentMethod]], None] = None


class ColDict(TypedDict):
    src: str
    frame_id: str
    props: NotRequired[dict]


class RowDict(TypedDict):
    cols: List[ColDict]
    props: NotRequired[dict]


class GridDict(TypedDict):
    rows: List[RowDict]


class LinkDict(TypedDict):
    type: str
    href: str
    label: str
    props: NotRequired[dict]


class FetchDict(TypedDict):
    type: str
    url: str
    label: str
    options: NotRequired[dict]
    framedata_field: NotRequired[str]
    props: NotRequired[dict]


class ComponentMethodDict(TypedDict):
    type: str
    label: str
    component: str
    method: str
    framedata_field: NotRequired[str]
    kwargs: NotRequired[dict]
    props: NotRequired[dict]


class PanelDict(TypedDict):
    label: str
    links: List[Union[LinkDict, FetchDict, ComponentMethodDict]]
    subtitle: NotRequired[str]


class HandlerFetchDict(TypedDict):
    type: str
    frame_id: str
    test: str
    url: str
    options: NotRequired[dict]
    framedata_field: NotRequired[str]
    props: NotRequired[dict]


class HandlerComponentMethodDict(TypedDict):
    type: str
    frame_id: str
    test: str
    component: str
    method: str
    framedata_field: NotRequired[str]
    kwargs: NotRequired[dict]
    props: NotRequired[dict]


class PageDict(TypedDict):
    grid: GridDict
    header: NotRequired[PanelDict]
    control: NotRequired[PanelDict]
    footer: NotRequired[PanelDict]
    handlers: Union[List[Union[HandlerFetchDict, HandlerComponentMethodDict]], None]
