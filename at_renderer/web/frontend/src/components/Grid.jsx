import { Layout, Row, Col, Skeleton, Typography, Menu, message, Empty, Spin } from "antd";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const getPage = async (authToken, setPage, setNoPage) => {
    const url = process.env.REACT_APP_API_URL || "";
    try {
        const response = await fetch(`${url}/api/page?auth_token=${authToken}`);
        if (response.ok) {
            const data = await response.json();
            setNoPage(false);
            setPage(data);
        } else if (response.status === 425) {
            setNoPage(true);
        }
    } catch (e) {
        message.error("Ошибка при получении конфигурации интерфейса");
        setNoPage(true);
        console.error(e);
    }
};

const EmptyPage = () => {
    const [_, setParams] = useSearchParams();
    return (
        <Empty image={<Spin style={{marginTop: 40}} size="large" />} description="Конфигурация интерфейса не задана, ожидайте">
            <Typography.Link onClick={() => setParams({})}>Выйти</Typography.Link>
        </Empty>
    );
};

const NoPage = () => (
    <Layout>
        <Layout.Header>
            <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                Средства визуализации пользовательских интерфесйсов
            </Typography.Title>
        </Layout.Header>
        <Layout.Content>
            <div style={{ padding: 20 }}>
                <EmptyPage />
            </div>
        </Layout.Content>
    </Layout>
);

const LoadinPage = () => (
    <Layout>
        <Layout.Header>
            <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                Средства визуализации пользовательских интерфесйсов
            </Typography.Title>
        </Layout.Header>
        <Layout.Content>
            <div style={{ padding: 20 }}>
                <Skeleton active />
            </div>
        </Layout.Content>
    </Layout>
);

export default () => {
    const [params, setParams] = useSearchParams();
    const [page, setPage] = useState(null);
    const [noPage, setNoPage] = useState(false);
    const wsRef = useRef();

    useEffect(() => {
        const authToken = params.get("auth_token");
        if (authToken) {
            getPage(authToken, setPage, setNoPage);
        }
    }, [params]);

    useEffect(() => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        const authToken = params.get("auth_token");
        const url = process.env.REACT_APP_WS_URL || "";
        const ws = new WebSocket(`${url}/api/ws/?auth_token=${authToken}`);
        wsRef.current = ws;
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data from server:", data);
            setNoPage(false);
            setPage(data);
        };
        ws.onclose = () => {
            console.log("WebSocket connection closed");
            message.error("Соединение разорвано");
            setParams({});
        };
    }, [params]);
    debugger;
    return noPage ? (
        <NoPage />
    ) : page ? (
        <Layout>
            {page?.header ? (
                <Layout.Header>
                    {
                        <Row>
                            <Col>
                                <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                                    {page?.header?.label || ""}
                                </Typography.Title>
                            </Col>
                            <Col flex="auto">
                                <Menu
                                    theme="dark"
                                    mode="horizontal"
                                    items={page?.header?.links?.map((link, i) => ({
                                        key: i,
                                        label:
                                            link.type === "href" ? (
                                                <a {...link?.props} href={link?.href}>
                                                    {link?.label}
                                                </a>
                                            ) : link.type === "fetch" ? (
                                                <div
                                                    onClick={async () => fetch(link?.url, link?.options)}
                                                    {...link?.props}
                                                >
                                                    {link?.label}
                                                </div>
                                            ) : (
                                                <div>{link?.label}</div>
                                            ),
                                    }))}
                                />
                            </Col>
                        </Row>
                    }
                </Layout.Header>
            ) : (
                <></>
            )}
            <Layout.Content style={{ height: "100%" }}>
                {page?.grid && page?.grid?.rows?.length ? (
                    page?.grid?.rows?.map((row) => (
                        <Row {...row?.props}>
                            {row?.cols?.map((col) => (
                                <Col {...col?.props}>
                                    <iframe
                                        style={{ borderWidth: 1, padding: 0 }}
                                        height={"100%"}
                                        width={"100%"}
                                        src={col?.src}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ))
                ) : (
                    <EmptyPage />
                )}
            </Layout.Content>
            {page?.footer ? (
                <Layout.Footer>
                    {
                        <Row>
                            <Col>
                                <Typography.Title style={{ margin: 0, padding: 15 }} level={3}>
                                    {page?.footer?.label || ""}
                                </Typography.Title>
                            </Col>
                            <Col>
                                <Menu
                                    mode="horizontal"
                                    items={page?.footer?.links?.map((link, i) => ({
                                        key: i,
                                        label: (
                                            <a {...link?.props} href={link?.href}>
                                                {link?.label}
                                            </a>
                                        ),
                                    }))}
                                />
                            </Col>
                        </Row>
                    }
                </Layout.Footer>
            ) : (
                <></>
            )}
        </Layout>
    ) : (
        <LoadinPage />
    );
};
