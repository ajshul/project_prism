export function CollaborationPage() {
  return (
    <div className="container">
      <h1 className="page-title">Collaboration (Alpha)</h1>
      <div className="card-surface" style={{ marginTop: 16 }}>
        <p>Realtime chat, presence, and peer feedback will appear here.</p>
        <ul>
          <li>Presence indicators</li>
          <li>Threaded chat and file links</li>
          <li>Peer review rubric drafts</li>
        </ul>
        <button className="pixel-button">Start Team Session</button>
      </div>
    </div>
  );
}
