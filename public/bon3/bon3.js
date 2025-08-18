// Shiki class for generating mathematical expressions
class Shiki {
  constructor(variableName) {
    this.variableName = variableName;
    this.root = new Shiki.Operator('*');
    this.root.left = new Shiki.Operand.Variable(this.variableName);
    this.root.right = new Shiki.Operand.Number(1);
  }

  getFunction() {
    return new Function(this.variableName, 'return ' + this.getString() + ';');
  }

  getString() {
    return this.root.getString();
  }

  step() {
    let i = 0;
    const before = this.root.getString();
    let after = before;
    while (i < 10 && before === after) {
      const node = this.getRandomOperator(this.root);
      Shiki.choice([this.wrapNode, this.cutNode, this.bang]).call(this, node);
      after = this.root.getString();
      i++;
    }
  }

  getRandomOperator(root) {
    let current = root;
    while (Math.random() < 0.3) {
      const index = current.randomIndex();
      if (current[index].isOperator) {
        current = current[index];
      } else {
        return current;
      }
    }
    return current;
  }

  getRandomNode(root) {
    let current = root;
    while (current.isOperator && Math.random() < 0.8) {
      current = current[current.randomIndex()];
    }
    return current;
  }

  getRandomOperand(root) {
    let current = root;
    while (current.isOperator) {
      current = current[current.randomIndex()];
    }
    return current;
  }

  wrapNode(node) {
    const index = node.randomIndex();
    const operator = this.randomOperator();
    let lr = [node[index], this.randomInstance()];
    if (Math.random() > 0.5) lr = [lr[1], lr[0]];
    operator.left = lr[0];
    operator.right = lr[1];
    node[index] = operator;
  }

  cutNode(node) {
    const index = node.randomIndex();
    const child = this.getRandomNode(node[index]);
    node[index] = child;
  }

  bang(node) {
    node.bang();
  }

  changeValue(node) {
    node[node.randomIndex()] = this.randomInstance();
  }

  randomOperator() {
    const r = new Shiki.Operator(Shiki.choice(Shiki.Operator.operators));
    r.left = this.randomInstance();
    r.right = this.randomInstance();
    return r;
  }

  randomInstance() {
    const rand = Math.random();
    if (rand > 0.7) {
      return this.randomOperator();
    } else if (rand > 0.4) {
      return new Shiki.Operand.Number();
    } else {
      return new Shiki.Operand.Variable(this.variableName);
    }
  }
}

Shiki.choice = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};

Shiki.Operator = class {
  constructor(operator) {
    if (operator != null) {
      this.operator = operator;
    } else {
      this.bang();
    }
    this.left = new Shiki.Operand(0);
    this.right = new Shiki.Operand(0);
  }

  getString() {
    return '(' + [this.left.getString(), this.operator, this.right.getString()].join('') + ')';
  }

  bang() {
    this.operator = Shiki.choice(Shiki.Operator.operators);
    if (this.left) this.left.bang();
    if (this.right) this.right.bang();
  }

  get isOperator() {
    return true;
  }

  randomIndex() {
    return Shiki.choice(['left', 'right']);
  }
};

Shiki.Operator.operators = '* % / + & | ^ << >>'.split(/\s+/);

Shiki.Operand = class {
  constructor(value) {
    this.value = value;
  }

  getString() {
    return this.value;
  }

  get isOperator() {
    return false;
  }
};

Shiki.Operand.Variable = class extends Shiki.Operand {
  bang() {
    // Variables don't change
  }
};

Shiki.Operand.Number = class extends Shiki.Operand {
  constructor() {
    super();
    this.bang();
  }

  bang() {
    this.value = Math.floor(Math.random() * 10) + 1;
  }
};

// Web Audio API based oneliner
class OneLiner {
  constructor() {
    this.audioContext = null;
    this.phase = 0;
    this.func = (t) => t;
    this.isPlaying = false;
    this.gain = null;
    this.scriptNode = null;
  }

  initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gain = this.audioContext.createGain();
      this.gain.gain.value = 0.3;
      this.gain.connect(this.audioContext.destination);
    }
  }

  start() {
    if (this.isPlaying) return;
    
    this.initialize();
    
    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const bufferSize = 1024;
    this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 0, 1);
    
    this.scriptNode.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        const t = this.phase | 0;
        output[i] = (((this.func(t) % 256) / 128.0) - 1.0) * 0.3;
        this.phase += 8000 / this.audioContext.sampleRate;
      }
    };
    
    this.scriptNode.connect(this.gain);
    this.isPlaying = true;
    
    console.log('OneLiner started, audioContext state:', this.audioContext.state);
  }

  stop() {
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
    this.isPlaying = false;
  }

  setFunction(func) {
    this.func = func;
  }
}

// FFT analyzer using Web Audio API
class FFTAnalyzer {
  constructor(oneLiner) {
    this.oneLiner = oneLiner;
    this.analyser = null;
    this.dataArray = null;
    this.interval = 25;
    this.isAnalyzing = false;
    this.onfft = null;
  }

  initialize() {
    if (!this.oneLiner.audioContext) return;
    
    this.analyser = this.oneLiner.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
    
    this.oneLiner.gain.connect(this.analyser);
  }

  start() {
    if (this.isAnalyzing) return;
    
    this.initialize();
    this.isAnalyzing = true;
    
    const analyze = () => {
      if (!this.isAnalyzing) return;
      
      this.analyser.getFloatFrequencyData(this.dataArray);
      
      if (this.onfft) {
        this.onfft(this.dataArray);
      }
      
      setTimeout(analyze, this.interval);
    };
    
    analyze();
  }

  stop() {
    this.isAnalyzing = false;
  }
}

// Utility functions
function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function loadImages(srcs) {
  return new Promise((resolve) => {
    const imgs = [];
    let loadedCount = 0;
    
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
      imgs.push(img);
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === srcs.length) {
          resolve(imgs);
        }
      };
    });
  });
}

function main(sources) {
  const characterImages = sources.images;
  const characterImagesRest = characterImages.slice(1);
  
  const oneLiner = new OneLiner();
  const fft = new FFTAnalyzer(oneLiner);
  
  let tracks = [];
  function setTracks() {
    tracks = [];
    for (let i = 0; i < 8; i++) {
      const t = new Shiki('t');
      t.step();
      t.step();
      tracks.push(t);
    }
  }
  
  let indexes = [];
  function setIndexes() {
    indexes = [];
    for (let i = 0; i < tracks.length * 2; i++) {
      indexes.push(Math.floor((i / 2) % tracks.length));
    }
  }
  
  setTracks();
  setIndexes();
  
  // Canvas setup
  const canvas = document.querySelector('canvas');
  let canvasWidth = 0;
  let canvasHeight = 0;
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvasWidth = Math.max(window.innerWidth, 1040);
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }
  
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
  
  resizeCanvas();
  
  const characterWidth = 250;
  const characterHeight = 400;
  const bottomRate = 0.9;
  const footerHeight = 70;
  
  let characterColor = randomColor();
  
  function setCharacterColor() {
    characterColor = randomColor();
  }
  
  function resetStage() {
    setTracks();
    setIndexes();
    setCharacterColor();
  }
  
  function clearStage() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  function drawCharacter(index, power) {
    let offsetTotal = canvasWidth - characterWidth * 4;
    if (offsetTotal < 0) offsetTotal = 0;
    const offsetOne = offsetTotal / 5;
    
    const left = offsetOne + (characterWidth + offsetOne) * index;
    const bottom = Math.min(canvasHeight * bottomRate, canvasHeight - footerHeight);
    
    const chara = power < 0.2 ? characterImages[0] : choice(characterImagesRest);
    
    ctx.fillStyle = characterColor;
    ctx.fillRect(Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight);
    ctx.drawImage(chara, Math.floor(left), Math.floor(bottom - power * 50 - characterHeight), characterWidth, characterHeight);
  }
  
  function drawEarth(power) {
    const bottom = Math.min(canvasHeight * bottomRate, canvasHeight - footerHeight) - power * 50;
    ctx.fillStyle = characterColor;
    ctx.fillRect(0, bottom, canvasWidth, canvasHeight);
  }
  
  let zeroTimes = 0;
  
  fft.onfft = (res) => {
    let len = 0;
    let sum = 0;
    const segments = [0, 0, 0, 0];
    const half = res.length / 2;
    
    for (let i = 0; i < res.length; i++) {
      if (i < 2) continue;
      if (i > half) break;
      
      const v = res[i];
      if (isNaN(v)) continue;
      
      const absv = Math.abs(v + 140); // Adjust for frequency data range
      sum += absv;
      len++;
      
      segments[Math.floor(i * segments.length / half)] += absv;
    }
    
    if (len > 0) {
      sum /= len;
      for (let i = 0; i < segments.length; i++) {
        segments[i] = segments[i] / len * segments.length;
      }
    }
    
    // Zero check
    if (zeroTimes * fft.interval > 1000) {
      resetStage();
      zeroTimes = 0;
    }
    
    if (sum < 1.0) {
      zeroTimes++;
    } else if (zeroTimes > 0) {
      zeroTimes = 0;
    }
    
    segments[1] *= 1.5;
    segments[2] *= 2;
    segments[3] *= 3;
    
    // Draw
    clearStage();
    drawEarth(sum / 20);
    
    for (let i = 0; i < 4; i++) {
      drawCharacter(i, segments[i] / 20);
    }
  };
  
  let timerCount = 0;
  const timer = setInterval(() => {
    const i = timerCount;
    
    const track = tracks[indexes[i % indexes.length]];
    oneLiner.setFunction(track.getFunction());
    
    if (Math.random() < 0.05) {
      track.step();
      oneLiner.setFunction(track.getFunction());
    }
    
    if (Math.random() < 0.1) {
      indexes[i % indexes.length] = Math.floor(Math.random() * tracks.length);
    }
    
    if (Math.random() < 0.1) {
      indexes[i % indexes.length] = indexes[(i + indexes.length - 1) % indexes.length];
    }
    
    if (i % indexes.length === indexes.length - 1) {
      if (Math.random() < 0.5 && indexes.length > 2) {
        indexes = indexes.slice(0, indexes.length / 2);
      } else if (Math.random() < 0.5) {
        indexes = indexes.concat(indexes);
      }
    }
    
    timerCount++;
  }, 125);
  
  document.body.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') return;
    resetStage();
  });
  
  document.querySelector('.sound-off').addEventListener('click', (e) => {
    e.preventDefault();
    oneLiner.start();
    fft.start();
    document.getElementById('volume').classList.toggle('on');
    return false;
  });
  
  document.querySelector('.sound-on').addEventListener('click', (e) => {
    e.preventDefault();
    oneLiner.stop();
    fft.stop();
    document.getElementById('volume').classList.toggle('on');
    return false;
  });
  
  return { oneLiner, fft };
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  // Check for Web Audio API support - most modern browsers support this
  if (!window.AudioContext && !window.webkitAudioContext) {
    const message = document.createElement('div');
    message.className = 'sorry';
    message.textContent = 'このブラウザはWeb Audio APIに対応していません。Chrome、Firefox、Safari、Edgeなどのモダンブラウザでお試しください。';
    document.body.appendChild(message);
    document.getElementById('footer').style.background = 'black';
    return;
  }
  
  console.log('Web Audio API available');
  
  loadImages([
    '/bon3/image/image1.png',
    '/bon3/image/image2.png', 
    '/bon3/image/image3.png',
    '/bon3/image/image4.png',
    '/bon3/image/image5.png',
    '/bon3/image/image6.png'
  ]).then((images) => {
    console.log('Images loaded');
    
    // Show tap to start for all browsers (modern requirement)
    document.getElementById('tap-to-start').style.display = 'block';
    document.getElementById('footer').classList.add('wait-touch');
    
    let hasStarted = false;
    document.addEventListener('click', () => {
      console.log('Click detected, hasStarted:', hasStarted);
      if (hasStarted) return;
      hasStarted = true;
      
      document.getElementById('tap-to-start').style.display = 'none';
      document.getElementById('footer').classList.remove('wait-touch');
      
      console.log('Starting main function');
      const app = main({ images });
      console.log('Main function returned:', app);
      
      // Auto-start audio after user interaction
      setTimeout(() => {
        console.log('Auto-starting audio');
        app.oneLiner.start();
        app.fft.start();
        document.getElementById('volume').classList.add('on');
      }, 100);
    }, { once: true });
  });
});