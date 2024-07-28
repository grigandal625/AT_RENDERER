import { useSearchParams, createBrowserRouter, RouterProvider } from "react-router-dom";
import Grid from "./components/Grid";
import Login from "./components/Login";

const Main = () => {
    const [params, _] = useSearchParams();
    if (params.get("auth_token")) {
        return <Grid />;
    }
    return <Login />;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main/>,
    },
    // Add more routes as needed...
]);

const App = () => <RouterProvider router={router} />;

export default App;
