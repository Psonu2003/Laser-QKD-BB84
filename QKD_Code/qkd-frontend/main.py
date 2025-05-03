# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import serial
import random
import json
import threading
import numpy as np
from pydantic import BaseModel

app = FastAPI()

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serial Setup
PORT = '/dev/cu.usbmodem2101'
BAUD = 9600
ser = serial.Serial(PORT, BAUD, timeout=1)
ser.reset_input_buffer()

# QKD Buffers
NUM_BITS = 8
BASIS_OPTIONS = ['+', 'x']
data_queue = []
lock = threading.Lock()

# Game State
alice_bits = ''
alice_bases = ''
eve_bases = ''
bob_bases = ''
eve_measurements = ''
bob_measurements = ''
current_index = 0
prev_phase = None
remaining_bits = NUM_BITS

def generate_new_keys():
    global alice_bits, alice_bases, eve_bases, bob_bases, eve_measurements, bob_measurements, current_index, prev_phase, remaining_bits
    alice_bits = ''.join(random.choice(['0', '1']) for _ in range(NUM_BITS))
    alice_bases = ''.join(random.choice(BASIS_OPTIONS) for _ in range(NUM_BITS))
    eve_bases = ''.join(random.choice(BASIS_OPTIONS) for _ in range(NUM_BITS))
    bob_bases = ''.join(random.choice(BASIS_OPTIONS) for _ in range(NUM_BITS))
    eve_measurements = ''
    bob_measurements = ''
    current_index = 0
    prev_phase = None
    remaining_bits = NUM_BITS

class PhaseRequest(BaseModel):
    phase: int

class BitsRequest(BaseModel):
    bits: int

@app.post("/start-phase")
def start_phase(req: PhaseRequest):
    global prev_phase
    if req.phase == prev_phase:
        return {"status": -1, "message": "Phase already completed"}
    phase = req.phase
    ser.write(f"{phase}".encode())  # Send "1" or "2" to Arduino
    prev_phase = phase
    return {"status": 1, "message": f"Phase {phase} started"}

@app.get("/config")
def get_config():
    print(alice_bits)
    return {
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "eve_bases": eve_bases,
        "bob_bases": bob_bases,
        "current_index": current_index,
        "num_bits": remaining_bits
    }

@app.post("/set-numbits")
def set_numbits(req: BitsRequest):
    global NUM_BITS, remaining_bits
    NUM_BITS = req.bits
    remaining_bits = NUM_BITS
    generate_new_keys()
    return {"message": "Number of bits set", "num_bits": NUM_BITS}

@app.post("/restart")
def restart():
    generate_new_keys()
    return {"message": "Restarted"}

@app.get("/next-data")
def next_data():
    global current_index, remaining_bits
    if current_index >= NUM_BITS:
        return {"done": True}
    
    if ser.in_waiting > 0:
        line = ser.readline().decode().strip()
        try:
            data = json.loads(line)
            name = data.get("Name")
            bit = str(data.get("Bit"))

            if name == "Eve":
                global eve_measurements
                eve_measurements += bit
            elif name == "Bob":
                global bob_measurements
                bob_measurements += bit
                current_index += 1  # Only increment when Bob measures
                remaining_bits -= 1

            
            return {"data": data, "current_index": current_index}
        except:
            return {"data": None, "current_index": current_index}
    return {"data": None, "current_index": current_index}

@app.get("/analyze")
def analyze():
    alice_bases_arr = np.array(list(alice_bases))
    bob_bases_arr = np.array(list(bob_bases))
    eve_bases_arr = np.array(list(eve_bases))
    sifted_alice_bases = np.full_like(alice_bases_arr, '-')
    sifted_bob_bases = np.full_like(bob_bases_arr, '-')
    sifted_eve_bases = np.full_like(eve_bases_arr, '-')

    alice_bits_arr = np.array(list(alice_bits))
    eve_measurements_arr = np.array(list(eve_measurements))
    bob_measurements_arr = np.array(list(bob_measurements))

    alice_bob_matching = np.where(alice_bases_arr == bob_bases_arr)[0]
    alice_eve_matching = np.where(alice_bases_arr == eve_bases_arr)[0]

    sifted_alice_bases[alice_bob_matching] = alice_bases_arr[alice_bob_matching]
    sifted_bob_bases[alice_bob_matching] = bob_bases_arr[alice_bob_matching]
    sifted_eve_bases[alice_eve_matching] = eve_bases_arr[alice_eve_matching]

    sifted_alice_bits = np.full_like(alice_bits_arr, '-')
    sifted_bob_bits = np.full_like(bob_measurements_arr, '-')
    sifted_eve_bits = np.full_like(eve_measurements_arr, '-')

    sifted_alice_bits[alice_bob_matching] = alice_bits_arr[alice_bob_matching]
    sifted_bob_bits[alice_bob_matching] = bob_measurements_arr[alice_bob_matching]
    sifted_eve_bits[sifted_eve_bases != '-'] = eve_measurements_arr[sifted_eve_bases != '-']

    mask = (sifted_alice_bits != '-') & (sifted_bob_bits != '-')
    agreements = sifted_alice_bits[mask] == sifted_bob_bits[mask]

    QBER = 1 - np.sum(agreements) / len(agreements) if len(agreements) > 0 else 0
    QBER = round(QBER * 100, 2)

    return {
        "alice_bases": alice_bases,
        "bob_bases": bob_bases,
        "eve_bases": eve_bases,
        "sifted_alice_bases": ''.join(sifted_alice_bases),
        "sifted_bob_bases": ''.join(sifted_bob_bases),
        "sifted_eve_bases": ''.join(sifted_eve_bases),
        "sifted_alice_bits": ''.join(sifted_alice_bits),
        "sifted_bob_bits": ''.join(sifted_bob_bits),
        "sifted_eve_bits": ''.join(sifted_eve_bits),
        "QBER": QBER
    }

# On server start
generate_new_keys()
