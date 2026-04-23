import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";
import PageMetadataLayout from "./PageMetadataLayout";

export const router = createBrowserRouter([
  {
    element: <PageMetadataLayout />,
    children: [...publicRoutes, ...protectedRoutes],
  },
]);
