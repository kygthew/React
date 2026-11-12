import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import JobsProvider from "./context/JobsProvider";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import RouteErrorPage from "./pages/RouteErrorPage";

// Lazy-loaded pages: each becomes a separate JS chunk.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const JobDetailsPage = lazy(() => import("./pages/JobDetailsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      {
        path: "jobs",
        children: [
          { index: true, element: <JobsPage /> },
          { path: ":id", element: <JobDetailsPage /> },
        ],
      },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return (
    <JobsProvider>
      <RouterProvider router={router} />
    </JobsProvider>
  );
}

export default App;
