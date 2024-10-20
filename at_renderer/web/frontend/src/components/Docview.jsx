import CodeEditorItem, { defaultEditorDidMount, defaultEditorOptions } from "../utils/CodeEditorItem";
import { Form, FloatButton, Button, Empty } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useSearchParams } from "react-router-dom";

export default () => {
    const [form] = Form.useForm();
    const [search, setSearch] = useSearchParams();

    const viewing = Boolean(search.get("viewing"));
    const docs = search.get("docs") ? window.decodeURIComponent(search.get("docs")) : undefined;
    const asFrame = search.get("asFrame");

    form.setFieldValue("docs", docs);

    const switchMode = (docs) => {
        const params = {};
        if (!viewing) {
            params["viewing"] = true;
        }
        if (docs) {
            form.setFieldValue("docs", docs);
            params["docs"] = docs;
        }
        if (asFrame !== null && asFrame !== undefined) {
            params["asFrame"] = asFrame;
        }
        setSearch(params);
    };

    const view = docs ? (
        <MarkdownPreview source={docs} style={{ padding: 16 }} />
    ) : (
        <Empty style={{ padding: 50 }} description="Нет содержимого для просмотра">
            <Button onClick={() => switchMode(docs)} icon={<EditOutlined />}>
                Редактировать содержимое
            </Button>
        </Empty>
    );

    const docView = viewing ? (
        view
    ) : (
        <Form form={form}>
            <Form.Item name="docs">
                <CodeEditorItem language="markdown" options={defaultEditorOptions} editorDidMount={defaultEditorDidMount} height={window.innerHeight.toString() + "px"} />
            </Form.Item>
        </Form>
    );

    const handleViewChange = () => {
        if (!viewing) {
            const newDocs = form.getFieldValue("docs");
            switchMode(newDocs);
        } else {
            switchMode(docs);
        }
    };

    return (
        <>
            {docView}
            {asFrame && viewing ? <></> : <FloatButton onClick={handleViewChange} type="primary" icon={viewing ? <EditOutlined /> : <EyeOutlined />} />}
        </>
    );
};
