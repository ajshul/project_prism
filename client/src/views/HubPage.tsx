import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function HubPage() {
  const [last, setLast] = useState<{ scenarioId: string | null } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/progress/last");
        if (!res.ok) return;
        const data = await res.json();
        setLast(data);
      } catch {}
    })();
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">Learning Hub</h1>
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card-surface">
          <div className="section-title">Your Journey</div>
          <p>Pick where to go next in your AI Literacy Quest.</p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Link to="/quest" className="pixel-button" data-variant="primary">
              Enter Current Quest
            </Link>
            <Link
              to="/persona"
              className="pixel-button"
              data-variant="secondary"
            >
              Edit Persona
            </Link>
            <Link to="/collab" className="pixel-button" data-variant="ghost">
              Open Collaboration
            </Link>
          </div>
          {last?.scenarioId && (
            <p style={{ marginTop: 12, color: "var(--color-muted)" }}>
              Where you left off: {last.scenarioId}
            </p>
          )}
        </div>
        <div className="card-surface">
          <div className="section-title">Skill Tree (Preview)</div>
          <ul style={{ margin: 0 }}>
            <li>Bias & Fairness — Initiate</li>
            <li>Data Literacy — Initiate</li>
            <li>Ethical Reasoning — Initiate</li>
          </ul>
        </div>
        <div className="card-surface">
          <div className="section-title">Peer Activity</div>
          <p>Live updates from your team will appear here.</p>
        </div>
      </div>
    </div>
  );
}
