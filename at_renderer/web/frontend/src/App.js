import { useSearchParams, createBrowserRouter, RouterProvider } from "react-router-dom";
import Grid from "./components/Grid";
import Login from "./components/Login";
import { useEffect, useState, useRef } from "react";
import Docview from "./components/Docview";

const Main = () => {
    const [params, _] = useSearchParams();
    const [frames, setFrames] = useState({});
    const messageListener = useRef();

    useEffect(() => {
        if (messageListener.current) {
            window.removeEventListener("message", messageListener.current);
        }
        messageListener.current = (e) => {
            debugger;
            if (e.data.frameId && Object.keys(frames).includes(e.data.frameId) && e.data.type === "urlUpdate") {
                const newFrames = { ...frames };
                newFrames[e.data.frameId] = e.data.url;
                setFrames(newFrames);
            }
            if (e.data.frameId && Object.keys(frames).includes(e.data.frameId) && e.data.type === "action") {
                const body = {};
                const url = process.env.REACT_APP_API_URL || "";
                body.auth_token = params.get("auth_token");
                body.component = 'ATController';
                body.method = 'handle_event'
                body.kwargs = { event: e.data.event, data: e.data.data, frames };
                fetch(`${url}/api/exec_method`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

            }
        };
        window.addEventListener("message", messageListener.current);
    }, [frames, setFrames]);

    if (params.get("auth_token")) {
        return <Grid frames={frames} setFrames={setFrames} />;
    }
    return <Login />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
    },
    {
        path: "/docview",
        element: <Docview />,
    },
]);

const App = () => <RouterProvider router={router} />;

export default App;
