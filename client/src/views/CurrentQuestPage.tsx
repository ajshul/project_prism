import { useEffect } from "react";
import { usePersonaStore } from "../zustand/personaStore";
import { useBranchingStore } from "../zustand/branchingStore";

export function CurrentQuestPage() {
  const persona = usePersonaStore((s) => s.persona);
  const { current, checkpoint, loading, error, initialize, choose } =
    useBranchingStore();

  useEffect(() => {
    initialize({
      theme: "The Fair Algorithm Challenge",
      learningTags: ["bias", "fairness", "data"],
      persona: { career: persona.career, style: persona.style },
      difficulty: "starter",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona.career, persona.style]);

  return (
    <div className="container">
      <h1 className="page-title">Current Quest</h1>
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card-surface">
          {loading && <p>Loading scene…</p>}
          {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          {current && (
            <div>
              <h2 style={{ marginTop: 0 }}>{current.title}</h2>
              <p>{current.narration}</p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                {current.choices.map((c) => (
                  <button
                    key={c.id}
                    className="pixel-button"
                    data-variant={c.id === "c1" ? "primary" : "secondary"}
                    onClick={async () => {
                      await choose(c.id);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  className="pixel-button"
                  data-variant="ghost"
                  onClick={() => useBranchingStore.getState().undo()}
                >
                  Undo
                </button>
              </div>
              {checkpoint && (
                <p style={{ marginTop: 8, color: "var(--color-muted)" }}>
                  Checkpoint: {checkpoint}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="card-surface">
          <div className="section-title">Scene Palette</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(current?.palette ?? ["#0aa6ff", "#a970ff", "#ff9b2f"]).map(
              (hex) => (
                <div
                  key={hex}
                  style={{
                    width: 28,
                    height: 28,
                    background: hex,
                    border: "2px solid #000",
                  }}
                />
              )
            )}
          </div>
          <div className="section-title" style={{ marginTop: 16 }}>
            Actors & Props
          </div>
          <p style={{ margin: 0 }}>
            {(current?.characters ?? []).join(", ") || "(none)"}
          </p>
          <p style={{ marginTop: 6 }}>
            {(current?.props ?? []).join(", ") || "(none)"}
          </p>
        </div>
      </div>
    </div>
  );
}
