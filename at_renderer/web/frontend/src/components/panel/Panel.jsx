import { Row, Col, Menu, Typography } from "antd";
import Href from "./href/Href";
import Fetch from "./fetch/Fetch";

const PanelLink = ({ type, ...props }) => {
    const typeElements = {
        href: Href,
        fetch: Fetch,
    };

    const Component = typeElements[type] || (({ label }) => <div>{label}</div>);

    return <Component {...props} />;
};

export default ({ panel, frames }) => {
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
                    items={(panel.links || []).map((link, i) => ({
                        key: i,
                        label: <PanelLink {...link} />,
                    }))}
                />
            </Col>
        </Row>
    );
};
