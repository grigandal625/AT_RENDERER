from pydantic import BaseModel, Field
from typing import Dict, List, Union, Any, Optional
from pydantic.functional_validators import AfterValidator
from typing_extensions import Annotated

class ColDict(BaseModel):
    src: str
    frame_id: str
    props: Optional[Any] = Field(None)

class RowDict(BaseModel):
    cols: List[ColDict]
    props: Optional[Any] = Field(None)

class GridDict(BaseModel):
    rows: List[RowDict]


def href_validation(v: str):
    assert v == "href", f'Value must be equal to "href" but got "{v}"'
    return v

def fetch_validation(v: str):
    assert v == "fetch", f'Value must be equal to "fetch" but got "{v}"'
    return v

def component_method_validation(v: str):
    assert v == "component_method", f'Value must be equal to "component_method" but got "{v}"'
    return v


LinkHrefType = Annotated[str, AfterValidator(href_validation)]
LinkFetchType = Annotated[str, AfterValidator(fetch_validation)]
LinkComponentMethodType = Annotated[str, AfterValidator(component_method_validation)]

class LinkDict(BaseModel):
    type: LinkHrefType = Field(default="href")
    href: str
    label: str
    props: Optional[Any] = Field(None)

class FetchDict(BaseModel):
    type: LinkFetchType = Field(default="fetch")
    url: str
    options: Optional[Any] = Field(None)
    framedata_field: Optional[str] = Field(None)
    label: str
    props: Optional[Any] = Field(None)
    
class ComponentMethodDict(BaseModel):
    type: LinkComponentMethodType = Field(default="component_method")
    label: str
    component: str
    method: str
    framedata_field: Optional[str] = Field(None)
    kwargs: Optional[Any] = Field(None)
    props: Optional[Any] = Field(None)

class PanelDict(BaseModel):
    label: str
    links: List[Union[LinkDict, FetchDict, ComponentMethodDict]]
    subtitle: Optional[str] = Field(None)


class HandlerFetchDict(BaseModel):
    type: LinkFetchType = Field(default="fetch")
    url: str
    frame_id: str
    test: str
    options: Optional[Any] = Field(None)
    framedata_field: Optional[str] = Field(None)
    label: str
    props: Optional[Any] = Field(None)
    
    
class HandlerComponentMethodDict(BaseModel):
    type: LinkComponentMethodType = Field(default="component_method")
    frame_id: str
    test: str
    component: str
    method: str
    framedata_field: Optional[str] = Field(None)
    kwargs: Optional[Any] = Field(None)
    props: Optional[Any] = Field(None)


class PageDict(BaseModel):
    grid: GridDict
    header: Optional[PanelDict] = Field(None)
    control: Optional[PanelDict] = Field(None)
    footer: Optional[PanelDict] = Field(None)

class ExecMetod(BaseModel):
    component: str
    method: str
    kwargs: Dict
    auth_token: Optional[str] = Field(None)

class ExecMethodResult(BaseModel):
    result: Any