import NixieDisplay from "./NixieDisplay"; // <-- ✅ Import the component
export default function EvePanel({ eveMeasurements, eveBases, currentIndex, isLive, phase2Enabled }) {
    return (
      <div className="panel">
        <h2>Eve (Interceptor)</h2>
        {/* <p>{eveMeasurements === '' ? 'N/A' : eveMeasurements}</p> */}
        {eveMeasurements === '' 
          ? <p>N/A</p>
          : <NixieDisplay digits={eveMeasurements} />
        }
        <p>Basis: {eveBases[currentIndex] === '+' ? 'H/V' : 'D/A'}</p>
        <br />
        <div className="status-indicator">
            <div className={`dot ${isLive ? (!phase2Enabled ? 'live-transmitting' : 'live-receiving') : 'idle'}`}></div>
            <p style={{ fontSize: '14px', marginTop: '5px' }}>{isLive ? (!phase2Enabled ? 'Transmitting' : 'Intercepting'): 'Idle'}</p>
        </div>
      </div>
    );
  }
  