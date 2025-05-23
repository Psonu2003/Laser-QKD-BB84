import { use, useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

import AlicePanel from "./components/AlicePanel";
import EvePanel from "./components/EvePanel";
import BobPanel from "./components/BobPanel";
import ControlButtons from "./components/ControlButtons";
import ResultsPanel from "./components/ResultsPanel";
import BitInputPanel from "./components/BitInputPanel";
import "./index.css";


function App() {
  const [numBits, setNumBits] = useState(0);
  const [aliceBits, setAliceBits] = useState("");
  const [aliceBases, setAliceBases] = useState("");
  const [bobBases, setBobBases] = useState("");
  const [eveBases, setEveBases] = useState("");
  const [eveMeasurements, setEveMeasurements] = useState("");
  const [bobMeasurements, setBobMeasurements] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase2Enabled, setphase2Enabled] = useState(false);
  const [results, setResults] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [inputNumBits, setInputNumBits] = useState(0);
  const [numBitChange, setNumBitChange] = useState(false);
  const [startMeasurment, setStartMeasurement] = useState(false);
  const [firstConfigLoaded, setFirstConfigLoaded] = useState(false);




  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await axios.get('http://localhost:8000/config');
      setNumBits(res.data.num_bits); // update if numBits changed
      setAliceBits(res.data.alice_bits);
      setAliceBases(res.data.alice_bases);
      setBobBases(res.data.bob_bases);
      setEveBases(res.data.eve_bases);
      setCurrentIndex(res.data.current_index);

      // Initialize inputNumBits ONLY once
      if (!firstConfigLoaded) {
        setFirstConfigLoaded(true);
      }
      
    }, 10); // check every 1 second
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setInputNumBits(numBits);
  }, [firstConfigLoaded]);

  useEffect(() => {
    const savedEve = localStorage.getItem('eveMeasurements');
    const savedBob = localStorage.getItem('bobMeasurements');
    const savedStartMeasurement = localStorage.getItem('startMeasurement');
  
    if (savedEve) setEveMeasurements(savedEve);
    if (savedBob) setBobMeasurements(savedBob);
    if (savedStartMeasurement !== null) setStartMeasurement(savedStartMeasurement === 'true');
  }, []);
  

  useEffect(() => {
    let isCancelled = false;
  
    async function fetchLoop() {
      if (isCancelled) return;
    
      try {
        const res = await axios.get('http://localhost:8000/next-data');
        if (!isCancelled && res.data && !res.data.done) {
          const data = res.data.data;
          if (data) {
            if (data.Name === "Eve") {
              setEveMeasurements(prev => {
                const updated = prev + data.Bit;
                localStorage.setItem('eveMeasurements', updated);
                return updated;
              });
            } else if (data.Name === "Bob") {
              setBobMeasurements(prev => {
                const updated = prev + data.Bit;
                localStorage.setItem('bobMeasurements', updated);
                return updated;
              });
              setCurrentIndex(res.data.current_index);
            }
            setIsLive(false);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    
    
      if (!isCancelled) {
        fetchLoop();
      }
    }
  
    fetchLoop();
  
    return () => {
      isCancelled = true; // Clean up if component unmounts
    };
  }, []);

  useEffect(() => {
    if (numBitChange) {
      console.log("Sending numBits:", inputNumBits);
      axios.post('http://localhost:8000/set-numbits', { bits: inputNumBits })
      .then(response => {
        console.log("Backend updated numBits:", response.data);
      })
      .catch(err => {
        console.error("Error updating numBits:", err);
      });
      setNumBitChange(false);
    }
  }, [numBitChange]);
  


  async function handlePhase(phase) {
    try {
      const res = await axios.post('http://localhost:8000/start-phase', { phase });
      console.log("Phase response:", res.data);
      setStartMeasurement(true);
      localStorage.setItem('startMeasurement', true);
  
      if (res.data.status === 1) {
        setIsLive(true);
        if (phase === 1) {
          setphase2Enabled(true);
        } else if (phase === 2) {
          setphase2Enabled(false);
        }
      } else {
        // ⚡ Show error popup
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'This phase has already been completed! Please restart or initiate the next phase.',
          background: '#1a1a1a',
          color: '#00ffe0',
          confirmButtonColor: '#00ffe0'
        });
        
      }
    } catch (err) {
      console.error("Error starting phase:", err);
      alert("🚨 An error occurred trying to start the phase. Check backend connection.");
    }
  }
  

  async function handleRestart() {
    await axios.post('http://localhost:8000/restart');
    localStorage.removeItem('eveMeasurements');
    localStorage.removeItem('bobMeasurements');
    setStartMeasurement(false);
    localStorage.setItem('startMeasurement', false);
    window.location.reload();
  }
  

  async function handleAnalyze() {
    const res = await axios.get('http://localhost:8000/analyze');
    setResults(res.data);
  }

  function incrementBits() {
    setInputNumBits(prev => prev + 1);
    handleBitInput(prev => prev + 1);
    setNumBitChange(true);
  }
  
  function decrementBits() {
    setInputNumBits(prev => Math.max(prev - 1, 0));
    handleBitInput(prev => Math.max(prev - 1, 0));
    setNumBitChange(true);
  }
  

  return (
    <>
    
      <h1>QKD BB84 Control Center</h1>
      <div className="container">
        <div className="panel protocol-panel">
          <h2 className="protocol-title">BB84 Protocol</h2>

          <div className="subpanel-row">
            <AlicePanel 
              aliceBits={aliceBits} 
              aliceBases={aliceBases} 
              currentIndex={currentIndex} 
              isLive={isLive} 
              phase2Enabled={phase2Enabled} 
              numBits={numBits} 
            />
            <EvePanel 
              eveMeasurements={eveMeasurements} 
              eveBases={eveBases} 
              currentIndex={currentIndex} 
              isLive={isLive} 
              phase2Enabled={phase2Enabled} 
            />
            <BobPanel 
              bobMeasurements={bobMeasurements} 
              bobBases={bobBases} 
              currentIndex={currentIndex} 
              isLive={isLive} 
              phase2Enabled={phase2Enabled} 
            />
          </div>
        </div>
    </div>


      <div className="container">
        <div className="panel bit-input-panel">
          <h2>Bit Input</h2>
          <p>Set the number of bits to be sent. The default is 0 and the maximum is 8.</p>
          <BitInputPanel 
            inputNumBits={inputNumBits} 
            setInputNumBits={setInputNumBits} 
            startMeasurment={startMeasurment} 
            setNumBitChange={setNumBitChange} 
            onDecrementBits={decrementBits} 
            onIncrementBits={incrementBits}  
          />
        </div>
      </div>

      <ControlButtons 
        onPhase={handlePhase} 
        onRestart={handleRestart} 
        onAnalyze={handleAnalyze} 
        phase2Enabled={phase2Enabled}
        isLive={isLive}
        numBits={numBits}
      />
      <ResultsPanel results={results} />
    </>
  );
}

export default App;
