// Include the library
#include <SimpleWebSerial.h>

// Create an instance of the library
SimpleWebSerial WebSerial;

int IN1=8;
int IN2=7;
int ENA1=6;
int IN3=5;
int IN4=4;
int ENA2=9;
String val;

void setup() {
   pinMode(IN1,OUTPUT);
   pinMode(IN2,OUTPUT);  
   pinMode(IN3,OUTPUT);
   pinMode(IN4,OUTPUT); 
  // Initialize serial communication
  Serial.begin(9600);
  

}

void loop() {
    val = "";
    int delayTime = 0;
    analogWrite(ENA1, 95);// motor speed  
    analogWrite(ENA2, 95);// motor speed  
    if (Serial.available()) {
        val = Serial.readStringUntil(',');
        delayTime = Serial.parseInt();
        val.trim();
    }

    if (val == "r") 
    {
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,HIGH);
      digitalWrite(IN4,HIGH);// rotate forward
      digitalWrite(IN3,LOW);
      delay(50);
      analogWrite(ENA1, 140);// motor speed  
      analogWrite(ENA2, 140);
      delay(delayTime);
      analogWrite(ENA1, 95);// motor speed  
      analogWrite(ENA2, 95);
      delay(50);
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,LOW);
    }
    else if (val == "l") 
    { 
      digitalWrite(IN1,HIGH);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,HIGH);
      delay(50);
      analogWrite(ENA1, 140);// motor speed  
      analogWrite(ENA2, 140);
      delay(delayTime);
      analogWrite(ENA1, 95);// motor speed  
      analogWrite(ENA2, 95);
      delay(50);
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,LOW);
    }
    else if (val == "f") 
    { 
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,HIGH);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,HIGH);
      delay(50);
      analogWrite(ENA1, 140);// motor speed  
      analogWrite(ENA2, 140);
      delay(delayTime);
      analogWrite(ENA1, 95);// motor speed  
      analogWrite(ENA2, 95);
      delay(50);
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,LOW);
    }
    else if (val == "b") 
    { 
      digitalWrite(IN1,HIGH);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,HIGH);// rotate forward
      digitalWrite(IN3,LOW);
      delay(50);
      analogWrite(ENA1, 140);// motor speed  
      analogWrite(ENA2, 140);
      delay(delayTime);
      analogWrite(ENA1, 95);// motor speed  
      analogWrite(ENA2, 95);
      delay(50);
      digitalWrite(IN1,LOW);// rotate forward
      digitalWrite(IN2,LOW);
      digitalWrite(IN4,LOW);// rotate forward
      digitalWrite(IN3,LOW);
    }
    
}
