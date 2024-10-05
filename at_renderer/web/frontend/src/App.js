import { useSearchParams, createBrowserRouter, RouterProvider } from "react-router-dom";
import Grid from "./components/Grid";
import Login from "./components/Login";
import { useEffect, useState } from "react";

const Main = () => {
    const [params, _] = useSearchParams();
    const [frames, setFrames] = useState({});

    useEffect(() => {
        window.addEventListener("message", (e) => {
            if (e.data.frameId && Object.keys(frames).includes(e.data.frameId)) {
                const newFrames = { ...frames };
                newFrames[e.data.frameId] = e.data.url;
                setFrames(newFrames);
            }
        });
    }, []);

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
]);

const App = () => <RouterProvider router={router} />;

export default App;
