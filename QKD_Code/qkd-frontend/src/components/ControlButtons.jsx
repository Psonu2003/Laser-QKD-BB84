export default function ControlButtons({ onPhase, onRestart, onAnalyze, phase2Enabled, isLive, numBits }) {
    return (
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => onPhase(1)} disabled={(phase2Enabled || isLive) || numBits === 0}>🛸 Start Phase 1</button>
        <button onClick={() => onPhase(2)} disabled={(!phase2Enabled || isLive) || numBits === 0}>🚀 Start Phase 2</button>
        <button onClick={onRestart}>🔁 Restart</button>
        <button onClick={onAnalyze} disabled={numBits > 0}>🔍 Analyze</button>
      </div>
    );
  }
  