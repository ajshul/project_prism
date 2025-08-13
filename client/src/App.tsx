import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <main id="main" role="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
