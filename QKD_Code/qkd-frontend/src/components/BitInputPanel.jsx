export default function BitInputPanel({ inputNumBits, setInputNumBits, startMeasurment, setNumBitChange, onDecrementBits, onIncrementBits }) {

  return (

    <div className="bit-input-container">
        <button onClick={onDecrementBits} disabled={startMeasurment}>−</button>
        <input 
          type="number" 
          value={inputNumBits}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setInputNumBits('');
            } else {
              setInputNumBits(Math.max(0, Number(value) <= 8 ? Number(value) : 8));
            }
          }}
          onKeyDown={(e) => { 
            if (e.key === 'Enter') {
              setNumBitChange(true);
            }
          }}
          disabled={startMeasurment}
        />
        <button onClick={onIncrementBits} disabled={startMeasurment}>+</button>
      </div>
        );
      }