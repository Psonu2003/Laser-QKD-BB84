import NixieDisplay from "./NixieDisplay"; // <-- ✅ Import the component

export default function AlicePanel({ aliceBits, aliceBases, currentIndex, isLive, phase2Enabled, numBits }) {
  return (
    <div className="panel">
      <h2>Alice (Sender)</h2>

      {/* ✅ Use the NixieDisplay here */}
      <NixieDisplay digits={aliceBits.slice(0, currentIndex + 1)} />

      <p>Basis: {aliceBases[currentIndex] === '+' ? 'H/V' : 'D/A'}</p>
      <p>{numBits} bits remaining</p>

      <div className="status-indicator">
        <div className={`dot ${isLive && phase2Enabled ? 'live-transmitting' : 'idle'}`}></div>
        <p style={{ fontSize: '14px', marginTop: '5px' }}>
          {isLive && phase2Enabled ? 'Transmitting' : 'Idle'}
        </p>
      </div>
    </div>
  );
}
