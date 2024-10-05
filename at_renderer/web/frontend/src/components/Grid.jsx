import { Layout, Row, Col, Skeleton, Typography, Menu, message, Empty, Spin } from "antd";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
                    <iframe style={{ borderWidth: 1, padding: 0 }} height={"100%"} width={"100%"} src={col.src} id={col.frame_id} />
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

    useEffect(() => {
        if (!page?.grid?.rows?.length || noPage) {
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
    }, [page, noPage]);

    const header = page?.header ? (
        <Layout.Header>
            <Panel panel={page.header} />
        </Layout.Header>
    ) : (
        <></>
    );

    const footer = page?.footer ? (
        <Layout.Footer>
            <Panel panel={page.footer} frames={frames} />
        </Layout.Footer>
    ) : (
        <></>
    );

    return noPage ? (
        <NoPage />
    ) : page ? (
        <Layout>
            {header}
            <Layout.Content style={{ height: "100%" }}>
                <Frames grid={page.grid} />
            </Layout.Content>
            {footer}
        </Layout>
    ) : (
        <LoadingPage />
    );
};
