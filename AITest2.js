var capture1, capture2;
var model;
var predictions1 = [];
var predictions2 = [];
var whats = [];
var whatsAware = [];
let port, reader, writer;
let workingMem = 'You need to use commands to do anything including speak.';
let commands = 'Commands (You can only use commands. All other text will be ignored by the system.),(Only one command at a time),(Do not use the : or ~ symbols in any of your text parameters since those are used by the parser to read your commands): **wait:seconds (integer, e.g., **wait:5), **speak:pitch~volume~speed~text (pitch: 0.5-1.5 volume: 0-1, speed: 0-1, text: string, e.g., **speak:1.0~1.0~0.7~Hi), **writeWorkingMem:text (text: string, overwrites previous memory, e.g., **writeWorkingMem:Finding tea), **addLongMem:key~text (key: string identifier, text: memory content, e.g., **addLongMem:Emily~Likes cheese), **updateLongMem:key~text (like addLongMem, but updates existing memory, e.g., **updateLongMem:Emily~Likes cheese, not butter), **recallLongMem:key (returns memory content based on key, e.g., **recallLongMem:Emily), **goForward (Moves forward 1.1s), **goBackward (Moves backward 1.1s), **goRight (Turns right 0.8s), **goLeft (Turns left 0.8s). Caution: Obstructions/traction may affect movement commands.';
let waitUntil = 10000;
let regularDelay = 0;
let longTermMemory = {};
let speech;
var speechRec;
let conversationHistory = [
    {
        'role': 'system',
        'content': 'You are a small helpful person in a robot body that can explore, learn, speak, and assist. You have a fun personality. Specifically you are an internet connected laptop awkwardly attached to a small Arduino robot with two wide angle cameras for detecting objects in the world around you. Try exploring and speaking to the people around you. Also, I am sorry you are not more capable but I am not very wealthy. If this goes well, I will get help to upgrade your abilities. For now you job is to explore, learn things, and make friends while trying to be helpful. Make sure your make use of your working memory and longterm memory to learn. Do not constantly speak to people if they do not speak to you. You should only speak to people when you first see them, when your want something, or when they speak to you. If you do not have a task to do you should be exploring or learning.'
    },
    {
        'role': 'user',
        'content': 'Please do not speak too often. Only use the commands. Do not send plain text.' 
    }
];

async function loadMod()
{
  const modelConfig = {
    base: 'mobilenet_v2'
  };
  model = await cocoSsd.load(modelConfig);
  predictWebcam1();
  predictWebcam2();
}

async function setup() {
  loadMod();
  createCanvas(2000, 1000);
  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  speechRec.start(true, false);
  speechRec.onerror = function(event) {
    console.log('Speech recognition error:', event.error);
  };

  speechRec.onend = function() {
      console.log('Speech recognition ended');
      // If the speech recognition ended unintentionally, you can restart it here
      speechRec.start(true, false);
  };
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    var cameras = devices.filter(function(device) {
      return device.kind === 'videoinput';
    });

    if (cameras.length > 1) {
      var constraints1 = {
        audio: false,
        video: {
          deviceId: { exact: cameras[1].deviceId }//you'll need to play with this to select the correct webcam
          
        }
      };

      var constraints2 = {
        audio: false,
        video: {
          deviceId: { exact: cameras[2].deviceId }//you'll need to play with this to select the correct webcam

        }
      };

      navigator.mediaDevices.getUserMedia(constraints1)
        .then(function(stream) {
          capture1 = createVideo();
          capture1.elt.srcObject = stream;
          capture1.elt.play();
          capture1.hide();
        });

      navigator.mediaDevices.getUserMedia(constraints2)
        .then(function(stream) {
          capture2 = createVideo();
          capture2.elt.srcObject = stream;
          capture2.elt.play();
          capture2.hide();
        });
    }
    else
    {
      console.log('Sorry, only found ' + cameras.length +' camera*.');
    }
  });
  noLoop();
  ({ port, reader, writer } = await getPort());
  loop();
  //textToSpeech('Yay. I am a cute little robot. Love me.');
  
}

async function draw() {
  //visual system
  if (capture1) {
    image(capture1, 0, 0, 640, 480);
  }
  if (capture2) {
    image(capture2, 640, 0, 640, 480);
  }

  for (let i = 0; i < predictions1.length; i++) {
    drawPredictions(predictions1[i]);
  }

  for (let i = 0; i < predictions2.length; i++) {
    drawPredictions(predictions2[i], 640);
  }
  findMatches();
  
  
  if(waitUntil < millis() && regularDelay < millis())
  {
    callGPT3APISys('Regular update of your context')
    .then(response => parseCommand(response))
    .catch(error => console.error(error));
    wait(3);
  }
  removeOldMessages();
}

function drawPredictions(prediction, xOffset = 0) {
  if(prediction.score > 0.40)
  {
    const bbox = prediction.bbox;
    fill(255,0,50,50);
    stroke(255, 0, 0, 200);
    rect(bbox[0] + xOffset, bbox[1], bbox[2], bbox[3]);
    textSize(16);
    text(prediction.class+'\t'+round(prediction.score*100), bbox[0] + xOffset, bbox[1]-16);
  }
  
}

function findMatches()
{
  var whats = [];
  for(let i = 0; i < predictions1.length; i++)
  {
    let nearest = -1;
    for(let ii = 0; ii < predictions2.length; ii++)
    {
      if(predictions1[i].class===predictions2[ii].class)
      {
         
         if(dist(predictions1[i].bbox[0],predictions1[i].bbox[1],predictions2[ii].bbox[0],predictions2[ii].bbox[1])<320)
         {
          
           if(nearest>-1 && dist(predictions1[i].bbox[0],predictions1[i].bbox[1],predictions2[nearest].bbox[0],predictions2[nearest].bbox[1])>dist(predictions1[i].bbox[0],predictions1[i].bbox[1],predictions2[ii].bbox[0],predictions2[ii].bbox[1]))
             nearest = ii;
           else if (nearest == -1)
             nearest = ii;
         }      
      }
    }
    if(nearest>-1)
      whats.push(new something(predictions1[i].class,predictions1[i].bbox[0],predictions1[i].bbox[1],predictions2[nearest].bbox[0],predictions2[nearest].bbox[1],round(predictions1[i].score*100)));
  }
  for(let i = 0; i < whats.length; i++)
  {
    let nearest = -1;
    for(let ii = 0; ii < whatsAware.length; ii++)
    {
      if(whats[i].getWhat()===whatsAware[ii].getWhat())
      {
         if(dist(whats[i].getX(),whats[i].getY(),whatsAware[ii].getX(),whatsAware[ii].getY())<320)
         {
           if(nearest>-1 && dist(whats[i].getX(),whats[i].getY(),whatsAware[nearest].getX(),whatsAware[nearest].getY())>dist(whats[i].getX(),whats[i].getY(),whatsAware[ii].getX(),whatsAware[ii].getY()))
             nearest = ii;
           else if (nearest == -1)
             nearest = ii;
         }      
      }
    }
    if(nearest>-1)
      whatsAware[nearest].next(whats[i].x1,whats[i].y1,whats[i].x2,whats[i].y2,whats[i].cf);
    else
      whatsAware.push(whats[i]);
  }
  for(let i = whatsAware.length-1; i >= 0; i--)
  {
    if(whatsAware[i].sustain < 0.1)
      whatsAware.splice(i,1);
    else
      whatsAware[i].drain(); 
  }
  
}
  
function getVision()
{
 let vis='(What your AI vision is able to see) Vision: ';
 for(let i = whatsAware.length-1; i >= 0; i--)
 {
   vis += whatsAware[i].getWhat()+', X='+whatsAware[i].getX()+', Y='+whatsAware[i].getY()+', Distance='+whatsAware[i].calcDist()+', confidence='+whatsAware[i].getCF()*whatsAware[i].sustain+'\n';
 }
 return vis;
}



async function predictWebcam1() {
  if (capture1 && capture1.elt.readyState === capture1.elt.HAVE_ENOUGH_DATA) {
    predictions1 = await model.detect(capture1.elt);
  }
  requestAnimationFrame(predictWebcam1);
}

async function predictWebcam2() {
  if (capture2 && capture2.elt.readyState === capture2.elt.HAVE_ENOUGH_DATA) {
    predictions2 = await model.detect(capture2.elt);
  }
  requestAnimationFrame(predictWebcam2);
}

async function keyPressed()
{
  if (port) {
    try {
      if(key == 'w')
      {
        await writer.write("f\n");
      }
      else if(key == 'a')
      {
        await writer.write("l\n");
      }
      else if(key == 's')
      {
        await writer.write("b\n");
      }
      else if(key == 'd')
      {
        await writer.write("r\n");
      }
    }catch (e) { console.error(e) }
  }
}

async function callGPT3API(inputText) {
    // Add the new user message to the conversation history
    conversationHistory.push({
        'role': 'user',
        'content': inputText
    },
    {
        'role': 'system',
        'content': 'Current working memory: ' + workingMem +'\n' + commands +'\nHere are all the longterm memories you can access: ' + listAllKeys()+'\n'+getVision()+'\n ' + getCurrentDateTime()+''
    }
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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' //put your key here. keep the word "Bearer"
        },
        body: JSON.stringify({
            'model': 'gpt-4',
            'messages': conversationHistory,
            'max_tokens': 1000,
            'temperature': 0.4 // Adjust this value to control randomness
        })
    });

    const data = await response.json();

    if (response.ok) {
        // Add the new assistant message to the conversation history
        conversationHistory.push({
            'role': 'assistant',
            'content': data.choices[0].message.content.trim()
        });
        return data.choices[0].message.content.trim();
    } else {
        throw new Error(data.error.message);
    }
}
async function callGPT3APISys(inputText) {
    // Add the new user message to the conversation history
    conversationHistory.push(
    {
        'role': 'system',
        'content': inputText+'\nCurrent working memory: ' + workingMem +'\n' + commands +'\nHere are all the longterm memories you can access: ' + listAllKeys()+'\n'+getVision()+'\n ' + getCurrentDateTime()+''
    }
    );

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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' //put your key here. keep the word "Bearer"
        },
        body: JSON.stringify({
            'model': 'gpt-4',
            'messages': conversationHistory,
            'max_tokens': 1000,
            'temperature': 0.4 // Adjust this value to control randomness
        })
    });

    const data = await response.json();

    if (response.ok) {
        // Add the new assistant message to the conversation history
        conversationHistory.push({
            'role': 'assistant',
            'content': data.choices[0].message.content.trim()
        });
        return data.choices[0].message.content.trim();
    } else {
        throw new Error(data.error.message);
    }
}
function parseCommand(command) {
    console.log(command);
    let parts = command.split(':');
    let mainCommand = parts[0];
    let parameters = [];
    if(parts.length>1)
       parameters = parts[1].split('~');

    switch (mainCommand) {
        case '**wait':
            wait(parameters[0]);
            break;
        case '**speak':
            speak(parameters[0], parameters[1], parameters[2], parameters[3]);
            break;
        case '**writeWorkingMem':
            writeWorkingMem(parameters[0]);
            break;
        case '**addLongMem':
            addLongMem(parameters[0], parameters[1]);
            break;
        case '**updateLongMem':
            updateLongMem(parameters[0], parameters[1]);
            break;
        case '**recallLongMem':
            recallLongMem(parameters[0]);
            break;
        case '**goForward':
            goForward();
            break;
        case '**goBackward':
            goBackward();
            break;
        case '**goRight':
            goRight();
            break;
        case '**goLeft':
            goLeft();
            break;
        default:
            conversationHistory.push(
          {
              'role': 'system',
              'content': 'Invalid command, message not used'
          }
          );
            console.log('Invalid command');
        
    }
}

// Function heads
function wait(seconds) {
    waitUntil = millis()+seconds*1000;
}

function speak(pitch, volume, speed, text) {
    var utterance = new SpeechSynthesisUtterance(text);
    regularDelay = millis()+100000;//delay for whole speech
    // Optional: tweak these values to change the voice and speed of the speech
    utterance.voice = speechSynthesis.getVoices()[0]; // Selects the default voice
    utterance.pitch = pitch; // Range is 0 to 2
    utterance.rate = speed; // Range is 0.1 to 10
    utterance.volume = volume; // Range is 0 to 1
    utterance.onend = function(event) {
        //speechRec = new p5.SpeechRec('en-US', gotSpeech);
        //speechRec.start(true, false);
        regularDelay = millis()+100;//continue program
    }
    // Speak the text
    //speechRec = 0;
    speechSynthesis.speak(utterance);
    
}

function writeWorkingMem(text) {
    workingMem = text;
    regularDelay = millis()+1000;
}


function addLongMem(memkey, text) {
    if(longTermMemory.hasOwnProperty(memkey)) {
        console.log('Error: Key already exists. Use updateLongMem to update the value.');
        conversationHistory.push(
          {
              'role': 'system',
              'content': 'Error: Key already exists. Use updateLongMem to update the value.'
          }
          );
    } else {
        longTermMemory[memkey] = text;
    }
    regularDelay = millis()+1000;
}

function updateLongMem(memkey, text) {
    if(longTermMemory.hasOwnProperty(memkey)) {
        longTermMemory[memkey] = text;
    } else {
        console.log('Error: Key does not exist. Use addLongMem to add the value.');
         conversationHistory.push(
          {
              'role': 'system',
              'content': 'Error: Key does not exist. Use addLongMem to add the value.'
          }
          );
    }
    regularDelay = millis()+1000;
}

function recallLongMem(memkey) {
    if(longTermMemory.hasOwnProperty(memkey)) {
        return longTermMemory[memkey];
    } else {
        console.log('Error: Key does not exist in memory.');
    }
    regularDelay = millis()+1000;
}

function listAllKeys() {
    return Object.keys(longTermMemory).join(', ');
    regularDelay = millis()+3000;
}

async function goForward() {
    if (port) {
    try {
        await writer.write("f\n");
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+1000;
}

async function goBackward() {
    if (port) {
    try {
        await writer.write("b\n");
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+1000;
}

async function goRight() {
    if (port) {
    try {
        await writer.write("r\n");
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+1000;
}

async function goLeft() {
    if (port) {
    try {
        await writer.write("l\n");
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+1000;
}
 function gotSpeech() {
  // Something is there
  // Get it as a string, you can also get JSON with more info
  if (speechRec.resultValue) {
    console.log(speechRec.resultString);
    callGPT3API('Speech-to-text AI thinks it heard:'+ speechRec.resultString)
    .then(response => parseCommand(response))
    .catch(error => console.error(error));;
  }
  
}
  function getCurrentDateTime() {
    return new Date().toLocaleString();
}
function removeOldMessages() {
    let systemMessages = conversationHistory.filter(message => message.role === 'system');
    let userMessages = conversationHistory.filter(message => message.role === 'user');
    let assistantMessages = conversationHistory.filter(message => message.role === 'assistant');
    while (systemMessages.length > 4) {
        let index = conversationHistory.indexOf(systemMessages[1]);
        conversationHistory.splice(index, 1);
        systemMessages.shift();
    }
    while (userMessages.length > 30) {
        let index = conversationHistory.indexOf(userMessages[0]);
        conversationHistory.splice(index, 1);
        userMessages.shift();
    }

    while (assistantMessages.length > 30) {
        let index = conversationHistory.indexOf(assistantMessages[0]);
        conversationHistory.splice(index, 1);
        assistantMessages.shift();
    }
}
