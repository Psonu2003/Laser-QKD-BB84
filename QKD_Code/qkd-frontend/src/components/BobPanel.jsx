import NixieDisplay from "./NixieDisplay"; // <-- ✅ Import the component
export default function BobPanel({ bobMeasurements, bobBases, currentIndex, isLive, phase2Enabled }) {
    return (
        <div className="panel">
          <h2>Bob (Receiver)</h2>
      
          {
            bobMeasurements === '' 
              ? <p>N/A</p>
              : <NixieDisplay digits={bobMeasurements} />
          }
      
          <p>Basis: {bobBases[currentIndex] === '+' ? 'H/V' : 'D/A'}</p>
          <br />
          <div className="status-indicator">
            <div className={`dot ${isLive && !phase2Enabled ? 'live-receiving' : 'idle'}`}></div>
            <p style={{ fontSize: '14px', marginTop: '5px' }}>
              {isLive && !phase2Enabled ? 'Receiving' : 'Idle'}
            </p>
          </div>
        </div>
      );
  }
  