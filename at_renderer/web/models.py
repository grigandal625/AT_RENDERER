from pydantic import BaseModel, Field
from typing import Dict, List, Union
from pydantic.functional_validators import AfterValidator
from typing_extensions import Annotated

class ColDict(BaseModel):
    src: str
    props: Union[Dict, None] = None

class RowDict(BaseModel):
    cols: List[ColDict]
    props: Union[Dict, None] = None

class GridDict(BaseModel):
    rows: List[RowDict]


def href_validation(v: str):
    assert v == "href", f'Value must be equal to "href" but got "{v}"'
    return v

def fetch_validation(v: str):
    assert v == "fetch", f'Value must be equal to "fetch" but got "{v}"'
    return v


LinkHrefType = Annotated[str, AfterValidator(href_validation)]
LinkFetchType = Annotated[str, AfterValidator(fetch_validation)]

class LinkDict(BaseModel):
    type: LinkHrefType = Field(default="href")
    href: str
    label: str
    props: Union[Dict, None] = None

class FetchDict(BaseModel):
    type: LinkFetchType = Field(default="fetch")
    url: str
    options: Union[Dict, None] = None
    label: str
    props: Union[Dict, None] = None

class PanelDict(BaseModel):
    label: str
    links: List[Union[LinkDict, FetchDict]]

class PageDict(BaseModel):
    grid: GridDict
    header: Union[PanelDict, None] = None
    footer: Union[PanelDict, None] = None