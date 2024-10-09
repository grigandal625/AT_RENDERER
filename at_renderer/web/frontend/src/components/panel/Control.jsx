import { Typography, Button, Space } from "antd";
import { useSearchParams } from "react-router-dom";

export default ({ panel, frames }) => {
    const [search, _] = useSearchParams();

    const label = panel?.label ? (
        <Typography.Title style={{ marginTop: 0 }} level={3}>
            {panel.label}
        </Typography.Title>
    ) : (
        <></>
    );
    const subtitle = panel?.subtitle ? (
        <Typography.Title style={{ marginTop: 10 }} level={5}>
            {panel.subtitle}
        </Typography.Title>
    ) : (
        <></>
    );
    return (
        <div style={{backgroundColor: "white", padding: 10}}>
            {label}
            {subtitle}
            {panel?.links?.length ? (
                <Space>
                    {panel.links.map((link, i) => (
                        <Button
                            size="large"
                            type="primary"
                            onClick={() => {
                                if (link.type === "fetch") {
                                    const { options, framedata_field, url } = link;
                                    const body = JSON.parse(options?.body || "{}");
                                    if (framedata_field) {
                                        body[framedata_field] = frames;
                                    }
                                    fetch(url, { ...options, body: JSON.stringify(body) });
                                } else if (link.type === "component_method") {
                                    const url = process.env.REACT_APP_API_URL || "";
                                    const body = { ...link };
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
                            }}
                        >
                            {link.label}
                        </Button>
                    ))}
                </Space>
            ) : (
                <></>
            )}
        </div>
    );
};
