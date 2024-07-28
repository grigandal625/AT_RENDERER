import { Form, Input, Button, Layout, Typography } from "antd";
import { useSearchParams } from "react-router-dom";

export default () => {
    const [_, setParams] = useSearchParams();
    return (
        <Layout>
            <Layout.Header>
                <Typography.Title style={{ margin: 0, padding: 15, color: "white" }} level={3}>
                    Средства управления визуализацией пользовательских интерфейсов
                </Typography.Title>
            </Layout.Header>
            <Layout.Content>
                <div style={{ padding: 20 }}>
                    <Form layout="inline" onFinish={(params) => setParams(params)}>
                        <Form.Item
                            rules={[{ required: true, message: "Укаите ключ доступа" }]}
                            label="Ключ доступа"
                            name="auth_token"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" type="primary">
                                Отобразить интерфейс
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Layout.Content>
        </Layout>
    );
};
