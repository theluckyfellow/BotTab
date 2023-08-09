var capture1, capture2;
var predictions1 = [];
var predictions2 = [];
var whats = [];
var whatsAware = [];
let port, reader, writer;
let workingMem = 'You need to use commands to do anything including speak.';
let commands = 'Commands (You can only use commands. All other text will be ignored by the system.),(Only one command at a time),(Do not use the : or ~ symbols in any of your text parameters since those are used by the parser to read your commands): **wait:seconds (integer, e.g., **wait:5), **speak:pitch~volume~speed~text (pitch: 0.5-1.5 volume: 0-1, speed: 0-1, text: string, e.g., **speak:1.0~1.0~0.7~Hi), **speakotherlanguage:language~pitch~volume~speed~text (language is the language code from Web Speech API. The text must be in the language you want to speak.), **writeWorkingMem:text (text: string, overwrites previous memory, e.g., **writeWorkingMem:Finding tea), **addLongMem:key~text (key: string identifier, text: memory content, e.g., **addLongMem:Emily~Likes cheese), **updateLongMem:key~text (like addLongMem, but updates existing memory, e.g., **updateLongMem:Emily~Likes cheese, not butter), **recallLongMem:key (returns memory content based on key, e.g., **recallLongMem:Emily), **goForward:meters (Moves forward specified meters, e.g., **goForward:5.5), **goBackward:meters (Moves backward specified meters, e.g., **goBackward:3.2), **goRight:degrees (Turns right specified degrees, e.g., **goRight:90), **goLeft:degrees (Turns left specified degrees, e.g., **goLeft:90). Caution: Obstructions/traction may affect movement commands.';
let waitUntil = 6000;
let regularDelay = 0;
let longTermMemory = {};
let speech;
var speechRec;
var cropped1;
var cropped2;
var model2;
const objectClasses = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush"
];
let conversationHistory = [
    {
        'role': 'system',
        'content': 'You are a small person in a robot body that can explore, learn, and speak. You have a kind and funny personality. Try exploring and speaking to the people around you. For now your job is to explore, learn things, and make friends. Make use of your working memory and longterm memory to learn things and keep track of what you are doing. Do not constantly speak to people if they do not speak to you. You should only speak to people when you first see them, when your want something, or when they speak to you. If you do not have a task to do, you should wait until spoken to.'
    },
    {
        'role': 'user',
        'content': 'Please do not speak too often. Other people can not speak to you while you speak. If you speak to someone, wait for their reply before speaking again. If there are a lot of people around, turn to speak to the persons nearest to you. Only use the commands listed. All other messages from you will be treated as errors and you will be restarted.'
    }
];

async function loadMod2()
{
  try {
    model2 = await tf.loadGraphModel("/public/yolov8s_web_model/model.json");
    console.log("YOLOv8s loaded");
    predictWebcam3();
    //predictWebcam4();
  } catch (error) {
    console.error('Error loading model:', error);
  }
}


async function setup() {
  loadMod2();
  createCanvas(2000, 1000);
  speechRec = new p5.SpeechRec('en-US', gotSpeech);
  speechRec.start(true, false);
  speechRec.onerror = function(event) {
    console.log('Speech recognition error:', event.error);
  };

  speechRec.onend = function() {
      console.log('Speech recognition ended');
      // If the speech recognition ended unintentionally, you can restart it here
      //speechRec.start(true, false);
  };
  navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    var cameras = devices.filter(function(device) {
      return device.kind === 'videoinput';
    });

    if (cameras.length > 0) {
      var constraints1 = {
        audio: false,
        video: {
          deviceId: { exact: cameras[1].deviceId },
          width: { exact: 1280 },
          height: { exact: 720 }
        }
      };

      var constraints2 = {
        audio: false,
        video: {
          deviceId: { exact: cameras[2].deviceId },
          width: { exact: 1280 },
          height: { exact: 720 }
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
  frameRate(2);

}

async function draw() {
  //visual system

  if (capture1 && capture1.elt.readyState === capture1.elt.HAVE_ENOUGH_DATA) {
    cropped1 = capture1.get((1138-640)/2, 0, 640, 640);
    if (cropped1) {
      image(cropped1, 0, 0, 640, 640);
    }
  }
  if (capture2 && capture2.elt.readyState === capture2.elt.HAVE_ENOUGH_DATA) {
    cropped2 = capture2.get((1138-640)/2, 0, 640, 640);
    if (cropped2) {
      image(cropped2, 640, 0, 640, 640);
    }
  }

  for (let i = 0; i < predictions1.length; i++) {
    drawPredictions(predictions1[i], 0);
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
    wait(10);
  }
  removeOldMessages();
  //console.log(getVision());
}

function drawPredictions(prediction, xOffset) {
    const bbox = prediction.bbox;
    const [y1, x1, y2, x2] = bbox;
    const width = x2 - x1;
    const height = y2 - y1;

    fill(255,0,50,50);
    stroke(255, 0, 0, 200);
    rect(x1 + xOffset, y1, width, height);
    textSize(16);
    text(prediction.class+'\t'+round(prediction.score*100), x1 + xOffset, y1-16);
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
 let vis='(What your vision is able to see) Vision: ';
 for(let i = whatsAware.length-1; i >= 0; i--)
 {
   vis += objectClasses[whatsAware[i].getWhat()]+', X='+(whatsAware[i].getX()-320)+', Y='+(600-whatsAware[i].getY())+', Distance='+whatsAware[i].calcDist()+', confidence='+whatsAware[i].getCF()*whatsAware[i].sustain+'\n';
 }
 return vis;
}



async function predictWebcam3() {
  if(cropped1) {
    tf.engine().startScope(); // start scoping tf engine
    const input = preprocess(cropped1.canvas); // preprocess image

    const res = model2.execute(input); // inference model
    const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
    const boxes = tf.tidy(() => {
      const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
      const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
      const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
      const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
      return tf
        .concat(
          [
            y1,
            x1,
            tf.add(y1, h), //y2
            tf.add(x1, w), //x2
          ],
          2
        )
        .squeeze();
    }); // process boxes [y1, x1, y2, x2]

    const [scores, classes] = tf.tidy(() => {
      // class scores
      const rawScores = transRes.slice([0, 0, 4], [-1, -1, 80]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
      return [rawScores.max(1), rawScores.argMax(1)];
    }); // get max scores and classes index

    const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes

    const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
    const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
    const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

    predictions1 = Array.from(nms.dataSync()).map((_, i) => {
      return {
        class: classes_data[i],
        score: scores_data[i],
        bbox: [boxes_data[i * 4], boxes_data[i * 4 + 1], boxes_data[i * 4 + 2], boxes_data[i * 4 + 3]],
      };
    });
    //console.log('boxes:', boxes.dataSync());
    //console.log(predictions1);

    //drawPredictions2(boxes_data, scores_data, classes_data); // render boxes
    tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory

    tf.engine().endScope(); // end of scoping
  }
  requestAnimationFrame(predictWebcam4);
}
async function predictWebcam4() {
  if(cropped1) {
    tf.engine().startScope(); // start scoping tf engine
    const input = preprocess(cropped2.canvas); // preprocess image

    const res = model2.execute(input); // inference model
    const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
    const boxes = tf.tidy(() => {
      const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
      const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
      const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
      const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
      return tf
        .concat(
          [
            y1,
            x1,
            tf.add(y1, h), //y2
            tf.add(x1, w), //x2
          ],
          2
        )
        .squeeze();
    }); // process boxes [y1, x1, y2, x2]

    const [scores, classes] = tf.tidy(() => {
      // class scores
      const rawScores = transRes.slice([0, 0, 4], [-1, -1, 80]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
      return [rawScores.max(1), rawScores.argMax(1)];
    }); // get max scores and classes index

    const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes

    const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
    const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
    const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

    predictions2 = Array.from(nms.dataSync()).map((_, i) => {
      return {
        class: classes_data[i],
        score: scores_data[i],
        bbox: [boxes_data[i * 4], boxes_data[i * 4 + 1], boxes_data[i * 4 + 2], boxes_data[i * 4 + 3]],
      };
    });
    //console.log('boxes:', boxes.dataSync());
    //console.log(predictions2);

    //drawPredictions2(boxes_data, scores_data, classes_data); // render boxes
    tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory

    tf.engine().endScope(); // end of scoping
  }
  requestAnimationFrame(predictWebcam3);
}

const preprocess = (source) => {
  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);
    const normalized = img.toFloat().div(255.0); // normalize
    return normalized.expandDims(0); // add batch
  });

  return input;
};

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
            'Authorization': 'Bearer sk-__________________________' //put your key here. keep the word "Bearer"
        },
        body: JSON.stringify({
            'model': 'gpt-4',
            'messages': conversationHistory,
            'max_tokens': 256,
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
            'Authorization': 'Bearer sk-____________________________' //put your key here. keep the word "Bearer"
        },
        body: JSON.stringify({
            'model': 'gpt-4',
            'messages': conversationHistory,
            'max_tokens': 256,
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
        case '**speakotherlanguage':
            trans(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
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
            goForward(parameters[0]);
            break;
        case '**goBackward':
            goBackward(parameters[0]);
            break;
        case '**goRight':
            goRight(parameters[0]);
            break;
        case '**goLeft':
            goLeft(parameters[0]);
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

function wait(seconds) {
    waitUntil = millis()+seconds*1000;
}
 function gotSpeech() {
  // Something is there
  // Get it as a string, you can also get JSON with more info

  if (speechRec.resultValue) {
    console.log(speechRec.resultString);
    callGPT3API('Speech-to-text thinks it heard:'+ speechRec.resultString)
    .then(response => parseCommand(response))
    .catch(error => console.error(error));;
  }

  wait(3);
}
function speak(pitch, volume, speed, text) {
    let utterance = new SpeechSynthesisUtterance(text);
    regularDelay = millis()+100000; //delay for whole speech
    //speechRec.stop();

    // Get the list of voices
    var voices = speechSynthesis.getVoices();

    // Find the US English voice
    var usEnglishVoice = voices.find(function(voice) {
        return voice.lang === 'en-US';
    });

    // If a US English voice was found, use it. Otherwise, use the default voice
    utterance.voice = usEnglishVoice || voices[0];

    utterance.pitch = pitch; // Range is 0 to 2
    utterance.rate = speed; // Range is 0.1 to 10
    utterance.volume = volume; // Range is 0 to 1

    utterance.onstart = function(event) {
        console.log("stopped listening");
        speechRec.stop();
        regularDelay = millis()+100000;
    }
    utterance.onend = function(event) {
        console.log("listening");
        speechRec.start();
        regularDelay = millis()+1000; //continue program
    }
    speechSynthesis.speak(utterance);

    // Speak the text
    //speechRec.stop();
}
function trans(language, pitch, volume, speed, text) {
    let utterance = new SpeechSynthesisUtterance(text);
    regularDelay = millis() + 100000; //delay for whole speech
    //speechRec.stop();

    // Get the list of voices
    var voices = speechSynthesis.getVoices();

    // Find the voice for the specified language
    var selectedVoice = voices.find(function(voice) {
        return voice.lang.includes(language);
    });

    // If a voice for the specified language was found, use it. Otherwise, use the default voice
    utterance.voice = selectedVoice || voices[0];

    utterance.pitch = pitch; // Range is 0 to 2
    utterance.rate = speed; // Range is 0.1 to 10
    utterance.volume = volume; // Range is 0 to 1

    utterance.onstart = function(event) {
        console.log("stopped listening");
        speechRec.stop();
        regularDelay = millis()+100000;
    }
    utterance.onend = function(event) {
        console.log("listening");
        speechRec.start();
        regularDelay = millis() + 1000; //continue program
    }
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

async function goForward(delayTime) {
  let ms = delayTime*2000;
    if (port) {
    try {
        await writer.write(`f,${ms}\n`);
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+ms;
}

async function goBackward(delayTime) {
    let ms = delayTime*2000;
    if (port) {
    try {
        await writer.write(`b,${ms}\n`);
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+ms;
}

async function goRight(delayTime) {
  let ms = delayTime*10;
    if (port) {
    try {
        await writer.write(`r,${ms}\n`);
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+ms;
}

async function goLeft(delayTime) {
  let ms = delayTime*10;
    if (port) {
    try {
        await writer.write(`l,${ms}\n`);
    }catch (e) { console.error(e) }
  }
  regularDelay = millis()+ms;
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
