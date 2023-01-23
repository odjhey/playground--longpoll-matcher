import { createBrowserRouter } from "react-router-dom";
import SomePage from "./pages/SomePage";
import AboutPage from "./pages/AboutPage";
import OrdersPage from "./pages/OrdersPage";
import { Nav } from "./components/Nav";
import { App } from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Nav />,
        children: [
          { path: "/", element: <SomePage /> },
          { path: "/about", element: <AboutPage /> },
          { path: "/orders", element: <OrdersPage /> },
        ],
      },
    ],
  },
]);
