import "./ResultsPanel.css"; // We'll define some custom styles separately

export default function ResultsPanel({ results }) {
  if (!results) return null;

  const isSecure = results.QBER <= 25;

  return (
    <div id="results" className="grainy">
      <h2>Results</h2>

      {/* QBER Section */}
      <div className="qber-section">
        <h3>QBER: {results.QBER}%</h3>
        <div className={`security-status ${isSecure ? "secure" : "not-secure"}`}>
          {isSecure ? "SECURE CHANNEL" : "NOT SECURE - ABORT!"}
        </div>
      </div>

      <div className="results-sections">
        {/* Public Section */}
        <div className="results-column">
            <h3>Public</h3>
            <p><span className="label">Alice Bases:</span> <span className="value">{results.alice_bases}</span></p>
            <p><span className="label">Bob Bases:</span> <span className="value">{results.bob_bases}</span></p>
            <p><span className="label">Sifted Alice Bases:</span> <span className="value">{results.sifted_alice_bases}</span></p>
            <p><span className="label">Sifted Bob Bases:</span> <span className="value">{results.sifted_bob_bases}</span></p>
            <p><span className="label">Sifted Alice Bits:</span> <span className="value">{results.sifted_alice_bits}</span></p>
            <p><span className="label">Sifted Bob Bits:</span> <span className="value">{results.sifted_bob_bits}</span></p>
        </div>

        {/* Eavesdropper Section */}
        <div className="results-column">
            <h3>Eavesdropper</h3>
            <p><span className="label">Eve Bases:</span> <span className="value">{results.eve_bases}</span></p>
            <p><span className="label">Sifted Eve Bases:</span> <span className="value">{results.sifted_eve_bases}</span></p>
            <p><span className="label">Sifted Eve Bits:</span> <span className="value">{results.sifted_eve_bits}</span></p>
        </div>
      </div>
    </div>
  );
}
