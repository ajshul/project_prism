import { Link, Outlet, useLocation } from "react-router-dom";
import "./App.css";

function App() {
  const location = useLocation();
  return (
    <div>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <nav aria-label="Primary" className="top-nav">
        <div className="top-nav-inner">
          <Link className="brand" to="/">
            AI Literacy Quest
          </Link>
          <div className="nav-links" role="tablist" aria-label="Main sections">
            <Link
              to="/"
              className="pixel-button"
              data-variant={location.pathname === "/" ? "primary" : "ghost"}
              role="tab"
              aria-selected={location.pathname === "/"}
            >
              Hub
            </Link>
            <Link
              to="/quest"
              className="pixel-button"
              data-variant={
                location.pathname.startsWith("/quest") ? "primary" : "ghost"
              }
              role="tab"
              aria-selected={location.pathname.startsWith("/quest")}
            >
              Current Quest
            </Link>
            <Link
              to="/persona"
              className="pixel-button"
              data-variant={
                location.pathname.startsWith("/persona") ? "secondary" : "ghost"
              }
              role="tab"
              aria-selected={location.pathname.startsWith("/persona")}
            >
              Persona
            </Link>
            <Link
              to="/collab"
              className="pixel-button"
              data-variant={
                location.pathname.startsWith("/collab") ? "secondary" : "ghost"
              }
              role="tab"
              aria-selected={location.pathname.startsWith("/collab")}
            >
              Collaboration
            </Link>
          </div>
        </div>
      </nav>
      <main id="main" role="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
