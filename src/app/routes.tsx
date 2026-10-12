import { createBrowserRouter } from "react-router";
import Workspace from "../App";

export const router = createBrowserRouter([
  {
    path: "*",
    Component: Workspace,
  },
]);
