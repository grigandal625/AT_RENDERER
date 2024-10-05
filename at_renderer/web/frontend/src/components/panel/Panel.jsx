import { Row, Col, Menu, Typography } from "antd";
import Href from "./href/Href";
import Fetch from "./fetch/Fetch";
import ComponentMethod from "./componentMethod/ComponentMethod";
import { useSearchParams } from "react-router-dom";

const PanelLink = ({ type, ...props }) => {
    const typeElements = {
        href: Href,
        fetch: Fetch,
        component_method: ComponentMethod,
    };

    const Component = typeElements[type] || (({ label }) => <div>{label}</div>);

    return <Component {...props} />;
};

export default ({ panel, frames }) => {
    const [ search, _ ] = useSearchParams();
    const onMenuItemClick = ({ key }) => {
        const link = panel.links[parseInt(key)];
        if (link.type === "fetch") {
            const { options, framedata_field, url } = link;
            const body = JSON.parse(options?.body || "{}");
            if (framedata_field) {
                body[framedata_field] = frames;
            }
            fetch(url, { ...options, body: JSON.stringify(body) });
        } else if (link.type === "component_method") {
            const url = process.env.REACT_APP_API_URL || "";
            const body = {...link};
            body.auth_token = search.get("auth_token");
            if (link.framedata_field) {
                body.kwargs = body.kwargs || {};
                body.kwargs[link.framedata_field] = frames;
            }
            fetch(`${url}/api/exec_method`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
        }
    };

    return (
        <Row>
            <Col>
                <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                    {panel.label || ""}
                </Typography.Title>
            </Col>
            <Col flex="auto">
                <Menu
                    theme="dark"
                    mode="horizontal"
                    onClick={onMenuItemClick}
                    items={(panel.links || []).map((link, i) => ({
                        key: i,
                        label: <PanelLink {...link} frames={frames} />,
                    }))}
                />
            </Col>
        </Row>
    );
};
