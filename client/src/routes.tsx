import type { RouteObject } from "react-router-dom";
import App from "./App";
import { lazy, Suspense } from "react";
import { HubPage } from "./views/HubPage";
const CurrentQuestPage = lazy(() =>
  import("./views/CurrentQuestPage").then((m) => ({
    default: m.CurrentQuestPage,
  }))
);
const PersonaPage = lazy(() =>
  import("./views/PersonaPage").then((m) => ({ default: m.PersonaPage }))
);
const CollaborationPage = lazy(() =>
  import("./views/CollaborationPage").then((m) => ({
    default: m.CollaborationPage,
  }))
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HubPage /> },
      {
        path: "quest",
        element: (
          <Suspense fallback={<div className="container">Loading…</div>}>
            <CurrentQuestPage />
          </Suspense>
        ),
      },
      {
        path: "persona",
        element: (
          <Suspense fallback={<div className="container">Loading…</div>}>
            <PersonaPage />
          </Suspense>
        ),
      },
      {
        path: "collab",
        element: (
          <Suspense fallback={<div className="container">Loading…</div>}>
            <CollaborationPage />
          </Suspense>
        ),
      },
    ],
  },
];
