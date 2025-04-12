import { Layout, Row, Col, Skeleton, Typography, Modal, message, Empty, Spin } from "antd";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Control from "./panel/Control";
import Panel from "./panel/Panel";

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
        <Empty image={<Spin style={{ marginTop: 40 }} size="large" />} description="Конфигурация интерфейса не задана, ожидайте">
            <Typography.Link onClick={() => setParams({})}>Выйти</Typography.Link>
        </Empty>
    );
};

const NoPage = () => (
    <Layout>
        <Layout.Header>
            <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                Средства управления визуализацией пользовательских интерфейсов
            </Typography.Title>
        </Layout.Header>
        <Layout.Content>
            <div style={{ padding: 20 }}>
                <EmptyPage />
            </div>
        </Layout.Content>
    </Layout>
);

const LoadingPage = () => (
    <Layout>
        <Layout.Header>
            <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                Средства управления визуализацией пользовательских интерфейсов
            </Typography.Title>
        </Layout.Header>
        <Layout.Content>
            <div style={{ padding: 20 }}>
                <Skeleton active />
            </div>
        </Layout.Content>
    </Layout>
);

const FrameRow = ({ row }) => {
    if (!row || !row.cols) {
        return <></>;
    }

    return (
        <Row {...row.props}>
            {row.cols.map((col) => (
                <Col {...col.props}>
                    <iframe
                        style={{ borderWidth: 0, padding: 0 }}
                        height={"100%"}
                        width={"100%"}
                        src={col.src
                            .replace(/%location\.host%/g, window.location.host)
                            .replace(/%location\.port%/g, window.location.port)
                            .replace(/%location\.protocol%/g, window.location.protocol)}
                        id={col.frame_id}
                    />
                </Col>
            ))}
        </Row>
    );
};

const Frames = ({ grid }) => {
    if (!grid?.rows?.length) {
        return <EmptyPage />;
    }

    return grid.rows.map((row) => <FrameRow row={row} />);
};

export default ({ frames, setFrames }) => {
    const [params, setParams] = useSearchParams();
    const [page, setPage] = useState(null);
    const [noPage, setNoPage] = useState(false);
    const search = params;
    const [modal, contextHandler] = Modal.useModal();

    const wsRef = useRef();

    useEffect(() => {
        const authToken = params.get("auth_token");
        if (authToken) {
            getPage(authToken, setPage, setNoPage);
        }
    }, [params]);

    useEffect(() => {
        if (page?.handlers?.length) {
            page.handlers.forEach((handler) => {
                const frameId = handler.frame_id;
                const frameSrc = frames[frameId];
                debugger;
                const tester = new RegExp(handler.test);
                if (tester.test(frameSrc)) {
                    if (handler.type === "fetch") {
                        const { options, framedata_field, url } = handler;
                        const body = JSON.parse(options?.body || "{}");
                        if (framedata_field) {
                            body[framedata_field] = frames;
                        }
                        fetch(url, { ...options, body: JSON.stringify(body) });
                    } else if (handler.type === "component_method") {
                        const url = process.env.REACT_APP_API_URL || "";
                        const body = { ...handler };
                        body.auth_token = search.get("auth_token");
                        if (handler.framedata_field) {
                            body.kwargs = body.kwargs || {};
                            body.kwargs[handler.framedata_field] = frames;
                        }
                        fetch(`${url}/api/exec_method`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(body),
                        });
                    }
                }
            });
        }
    }, [frames]);

    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const connectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const authToken = params.get("auth_token");
        const url = process.env.REACT_APP_WS_URL || "ws://" + window.location.host;
        const ws = new WebSocket(`${url}/api/ws/?auth_token=${authToken}`);
        wsRef.current = ws;

        ws.onopen = function () {
            if (this.OPEN) {
                message.success("Успешно подключено");
                setReconnectAttempts(0);
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data from server:", data);
            if (data.type === "message") {
                const messageType = ["info", "error", "success", "warning"].includes(data.message_type) ? data.message_type : "info";

                if (data.modal) {
                    const messageCaller = modal[messageType] || modal.info;

                    messageCaller({
                        title: data.title || "",
                        content: (
                            <Typography.Paragraph>
                                <pre>{data.message}</pre>
                            </Typography.Paragraph>
                        ),
                        okText: "Ок",
                        cancelText: "Закрыть",
                    });
                } else {
                    const messageCaller = message[messageType] || message.info;
                    messageCaller(data.message);
                }
            } else {
                setNoPage(false);
                setPage(data);
            }
        };

        ws.onclose = () => {
            wsRef.current = undefined;
            if (reconnectAttempts < 5) {
                setTimeout(() => {
                    setReconnectAttempts(reconnectAttempts + 1);
                }, 1000);
            } else {
                console.log("WebSocket connection closed");
                message.error("Соединение разорвано");
                console.error("Max reconnect attempts reached. Giving up.");
                setParams({});
            }
        };
    };

    useEffect(() => {
        if (reconnectAttempts > 0 && reconnectAttempts < 5) {
            message.warning(`Соединение разорвано, попытка переподключиться ${reconnectAttempts}`);
            console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
            connectWebSocket();
        }
    }, [reconnectAttempts]);

    useEffect(() => {
        connectWebSocket();
        // Чистим WebSocket при размонтировании компонента
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [params]);

    useEffect(() => {
        if (!page?.grid?.rows?.length) {
            setFrames({});
        } else {
            const newFrames = Object.fromEntries(
                page.grid.rows.reduce((accumulator, row) => {
                    const allRowFrames = (row.cols || []).map((col) => [col.frame_id, col.src]);
                    return [...accumulator, ...allRowFrames];
                }, [])
            );

            setFrames(newFrames);
        }
    }, [page]);

    const header = page?.header ? (
        <Layout.Header>
            <Panel panel={page.header} frames={frames} textColor="white" />
        </Layout.Header>
    ) : (
        <></>
    );

    const control = page?.control ? (
        <div style={{ padding: 20 }}>
            <Control panel={page.control} frames={frames} />
        </div>
    ) : (
        <></>
    );

    const footer = page?.footer ? (
        <Layout.Footer>
            <Panel panel={page.footer} frames={frames} textColor="black" />
        </Layout.Footer>
    ) : (
        <></>
    );

    return (
        <>
            {noPage ? (
                <NoPage />
            ) : page ? (
                <Layout style={{ height: "100%" }}>
                    {header}
                    {control}
                    <Layout.Content style={{ height: "100%" }}>
                        <Frames grid={page.grid} />
                    </Layout.Content>
                    {footer}
                </Layout>
            ) : (
                <LoadingPage />
            )}
            {contextHandler}
        </>
    );
};
