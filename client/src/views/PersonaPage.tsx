import { usePersonaStore } from "../zustand/personaStore";
import { useEffect, useState } from "react";
import { apiPost } from "../workers/api";

export function PersonaPage() {
  const persona = usePersonaStore((s) => s.persona);
  const update = usePersonaStore((s) => s.update);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("/api/persona");
        if (!resp.ok) return;
        const data = (await resp.json()) as { career: any; style: any };
        if (!cancelled) update({ career: data.career, style: data.style });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [update]);

  return (
    <div className="container">
      <h1 className="page-title">Your Persona</h1>
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card-surface">
          <div className="section-title">Identity</div>
          <label>
            Career Interest
            <select
              value={persona.career}
              onChange={(e) => update({ career: e.target.value as any })}
              style={{ marginLeft: 8 }}
            >
              <option>Researcher</option>
              <option>Developer</option>
              <option>Ethicist</option>
              <option>Policy Maker</option>
              <option>Creative</option>
              <option>Entrepreneur</option>
            </select>
          </label>
          <div style={{ height: 8 }} />
          <label>
            Learning Style
            <select
              value={persona.style}
              onChange={(e) => update({ style: e.target.value as any })}
              style={{ marginLeft: 8 }}
            >
              <option>Visual</option>
              <option>Analytical</option>
              <option>Collaborative</option>
              <option>Independent</option>
              <option>Creative</option>
            </select>
          </label>
          <div style={{ height: 12 }} />
          <button
            className="pixel-button"
            data-variant="primary"
            onClick={async () => {
              try {
                setSaving(true);
                await apiPost<{ ok: boolean }>("/api/persona", persona);
                setStatus("Saved");
              } catch (e) {
                setStatus("Failed to save");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {status && (
            <span
              style={{
                marginLeft: 8,
                color:
                  status === "Saved"
                    ? "var(--color-success)"
                    : "var(--color-danger)",
              }}
            >
              {status}
            </span>
          )}
        </div>
        <div className="card-surface">
          <div className="section-title">Preview</div>
          <p style={{ marginTop: 0 }}>
            You are exploring as a <b>{persona.career}</b> with a
            <b> {persona.style}</b> learning style.
          </p>
          <p style={{ color: "var(--color-muted)" }}>
            Scenes and choices will reflect this to keep challenges engaging.
          </p>
        </div>
      </div>
    </div>
  );
}
