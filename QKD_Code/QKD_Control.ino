#include <ArduinoJson.h>

/*
QKD BB84 Protocol Control using KY-008 Laser transmitters and Laser detectors. 
The program defines two lasers: Alice and Eve. Alice sends a bit intended for Bob but
Eve intercepts this bit and attempts to send the same bit to Bob to go undetected. 

The control protocol is divided into two phases controlled by two buttons. Button1
initiates 'phase 1' which activates Alice's laser and Eve's measurement. Button2 
initiates 'phase 2' where Eve replicates Alice's bit and Bob measures.
*/

#define ALICE_LASER 2
#define EVE_LASER 4
#define EVE_DETECT0 7
#define EVE_DETECT1 8
#define BOB_DETECT0 12
#define BOB_DETECT1 11

#define BUTTON1 3 // Phase 1
#define BUTTON2 5 // Phase 2

const float BIT_THRESHOLD = 0.025;

int detected = LOW;
int AliceState = LOW;
int EveState = LOW;
int lastButton1State = HIGH;
int lastButton2State = HIGH;

int currentButton1State;
int currentButton2State;

JsonDocument Phase1;
JsonDocument Phase2;

void setupPhaseData(){
  Phase1["Laser"] = ALICE_LASER;
  Phase1["Detect0"] = EVE_DETECT0;
  Phase1["Detect1"] = EVE_DETECT1;
  Phase1["Name"] = "Eve";

  Phase2["Laser"] = EVE_LASER;
  Phase2["Detect0"] = BOB_DETECT0;
  Phase2["Detect1"] = BOB_DETECT1;
  Phase2["Name"] = "Bob";
}


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  pinMode(ALICE_LASER, OUTPUT);
  pinMode(EVE_LASER, OUTPUT);

  // turn off lasers
  digitalWrite(ALICE_LASER, LOW);
  digitalWrite(EVE_LASER, LOW);

  pinMode(BOB_DETECT0, INPUT);
  pinMode(BOB_DETECT1, INPUT);

  pinMode(EVE_DETECT0, INPUT);
  pinMode(EVE_DETECT1, INPUT);

  pinMode(BUTTON1, INPUT_PULLUP); // Phase 1
  pinMode(BUTTON2, INPUT_PULLUP); // Phase 2

  setupPhaseData();

}


void activateControlPhase(int BUTTON, int currentButtonState, int lastButtonState, JsonDocument phase){
  int LASER = phase["Laser"];
  int DETECT0 = phase["Detect0"];
  int DETECT1 =  phase["Detect1"];
  String name = phase["Name"];

  

  if (lastButtonState == HIGH && currentButtonState == LOW){ // check the falling edge of the button signal from HI to LO
    delay(50); // delay for debouncing

    if(digitalRead(BUTTON) == LOW){ // check again in case of bouncing 
      unsigned long startTime = millis();
      int count0 = 0, count1 = 0;
      JsonDocument data;
      data["Name"] = name;

      while (millis() - startTime < 2000) { // run for 2 seconds
        digitalWrite(LASER, HIGH);
        delayMicroseconds(200);

        int sample0 = 0, sample1 = 0;

        for (int i=0; i<3; i++){ // smooth our readings since detectors can be noisy
          sample0 += digitalRead(DETECT0);
          sample1 += digitalRead(DETECT1);
          delayMicroseconds(50);
          // Serial.print("Detect0:");
          // Serial.print(digitalRead(DETECT0));
          // Serial.print("  | Detect1:");
          // Serial.println(digitalRead(DETECT1));

          
        }

        digitalWrite(LASER, LOW);

        // count how many 0 or 1 bits
        if (sample0 > sample1) count0++;
        else if (sample1 > sample0) count1++;
        else if ((sample0 + sample1) > 0 && abs(sample0 - sample1) /float(sample0 + sample1) <= BIT_THRESHOLD) {
          count0++;
          count1++;
        }

        delay(10); 
        }
      int total = count0 + count1;
      if (total == 0){
        data["Bit"] = "-";
      }
      else if (abs(count0 - count1)/float(total) <= BIT_THRESHOLD) {
        data["Bit"] = random(2);
      }
      else if (count0 > count1) {
        data["Bit"] = 0;
      }
      else {
        data["Bit"] = 1;
      }

      data["Phase"] = (name == "Eve") ? 1 : 2;
      data["Count0"] = count0;
      data["Count1"] = count1;
      digitalWrite(LASER, LOW);
      serializeJson(data, Serial);
      Serial.println();
    }
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  currentButton1State = digitalRead(BUTTON1);
  activateControlPhase(BUTTON1, currentButton1State, lastButton1State, Phase1);
  lastButton1State = currentButton1State;

  currentButton2State = digitalRead(BUTTON2);
  activateControlPhase(BUTTON2, currentButton2State, lastButton2State, Phase2);
  lastButton2State = currentButton2State;  
}
