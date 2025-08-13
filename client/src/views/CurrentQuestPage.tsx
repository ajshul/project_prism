import { useEffect, useState } from "react";
import { gpt } from "../workers/gptClient";
import type { SceneSpec } from "../workers/schemas";
import { apiPost } from "../workers/api";
import { usePersonaStore } from "../zustand/personaStore";

export function CurrentQuestPage() {
  const [scene, setScene] = useState<SceneSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<string | null>(null);

  const persona = usePersonaStore((s) => s.persona);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const nextScene = await gpt.generateScene({
          theme: "The Fair Algorithm Challenge",
          learningTags: ["bias", "fairness", "data"],
          persona: { career: persona.career, style: persona.style },
          difficulty: "starter",
        });
        if (!cancelled) setScene(nextScene);
      } catch (e) {
        if (!cancelled) setError("Failed to load scene");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [persona.career, persona.style]);

  return (
    <div className="container">
      <h1 className="page-title">Current Quest</h1>
      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card-surface">
          {loading && <p>Loading scene…</p>}
          {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
          {scene && (
            <div>
              <h2 style={{ marginTop: 0 }}>{scene.title}</h2>
              <p>{scene.narration}</p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                {scene.choices.map((c) => (
                  <button
                    key={c.id}
                    className="pixel-button"
                    data-variant={c.id === 'c1' ? 'primary' : 'secondary'}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const prog = await apiPost<{
                          nextScene: SceneSpec;
                          checkpoint: string;
                          consequences: string[];
                          updatedLearningTags: string[];
                        }>("/api/gpt/story/progress", {
                          sceneId: scene.id,
                          choiceId: c.id,
                          priorState: {},
                        });
                        setScene(prog.nextScene);
                        setCheckpoint(prog.checkpoint);
                        apiPost("/api/progress/save", {
                          scenarioId: prog.nextScene.id,
                          state: { checkpoint: prog.checkpoint },
                        }).catch(() => {});
                        apiPost("/api/gpt/assess", {
                          evidenceEvents: [
                            {
                              type: "choice",
                              sceneId: scene.id,
                              choiceId: c.id,
                            },
                          ],
                          rubricVersion: "v1",
                          learnerProfile: {},
                        }).catch(() => {});
                      } catch (e) {
                        setError("Failed to progress story");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {c.label}
                  </button>
                ))}
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
            {(scene?.palette ?? ["#0aa6ff", "#a970ff", "#ff9b2f"]).map(
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
            {(scene?.characters ?? []).join(", ") || "(none)"}
          </p>
          <p style={{ marginTop: 6 }}>
            {(scene?.props ?? []).join(", ") || "(none)"}
          </p>
        </div>
      </div>
    </div>
  );
}
