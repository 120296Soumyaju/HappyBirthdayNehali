const startBtn = document.getElementById('startBtn');
const introText = document.getElementById('introText');
const fullMessage = "My dear best friend Nehali,\nIt's your birthday! 🎉\nI got some surprises for you.\nI hope you would love this.\n\nSo now... click on the Play button! 🎂\n\n - Sujju 😊";
const song = document.getElementById('song');
const scene = document.querySelector('.scene');
const flame = document.getElementById('flame');
const banner = document.querySelector('.gold-banner');
const lights = document.querySelector('.lights');
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const balloons = document.querySelector('.balloon-container');

let typingIndex = 0;

function typeIntro() {
  if (typingIndex < fullMessage.length) {
    introText.textContent += fullMessage.charAt(typingIndex);
    typingIndex++;
    setTimeout(typeIntro, 50); // typing speed (ms)
  }
}

typeIntro();

let confetti = [];

const colors = ['#FFC107', '#E91E63', '#00BCD4', '#4CAF50', '#FF5722'];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createConfettiPiece() {
  return {
    x: random(0, canvas.width),
    y: random(-canvas.height, 0),
    size: random(8, 15),
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: random(2, 5),
    speedX: random(-2, 2),
    rotation: random(0, 360),
    rotationSpeed: random(-5, 5)
  };
}

function initConfetti(count = 200) {
  confetti = [];
  for (let i = 0; i < count; i++) {
    confetti.push(createConfettiPiece());
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confetti.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();

    // Update motion
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;

    // Respawn if below screen
    if (p.y > canvas.height) {
      p.y = -20;
      p.x = random(0, canvas.width);
    }
  });
  requestAnimationFrame(drawConfetti);
}

function startConfetti() {
  canvas.style.display = 'block';
  initConfetti();
  drawConfetti();
}

function randomColor() {
  const colors = ['#FF3B3F', '#FF9900', '#FFD700', '#33CC33', '#3399FF', '#CC33FF', '#FF69B4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function launchBalloons(count = 40) {
  const container = document.querySelector('.balloon-container');

  const directions = ['bottom', 'left', 'right'];

  for (let i = 0; i < count; i++) {
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');
    if (Math.random() > 0.5) balloon.classList.add('curly');

    const dir = directions[Math.floor(Math.random() * directions.length)];
    balloon.dataset.dir = dir;

    // Common properties
    balloon.style.background = randomColor();
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = `${6 + Math.random() * 4}s`;
    balloon.style.animationDelay = `${Math.random() * 2}s`;
    balloon.style.zIndex = 998;

    // Set position and direction-based animation
    if (dir === 'bottom') {
      balloon.style.left = `${Math.random() * 100}vw`;
      balloon.style.bottom = '-100px';
      balloon.style.top = 'auto'; // reset accidental override
    } 

    container.appendChild(balloon);
    setTimeout(() => balloon.remove(), 12000);
  }
}



startBtn.addEventListener('click', () => {
  // hide intro message permanently
  document.getElementById('introText').classList.add('hidden');

  song.play();
  startBtn.classList.add('hidden');
  scene.classList.remove('hidden');

  listenForBlow();
  startConfetti();
  launchBalloons(80);
  

});

function openGift() {
  const lid = document.getElementById('lid');
  const card = document.getElementById('greetingCard');
  const clickText = document.querySelector('.click-text');

  lid.style.transform = 'rotate(-45deg) translate(-40px, -40px)';
  clickText.style.display = 'none'; // hide hint

  setTimeout(() => {
    card.classList.remove('hidden');
  }, 500);
}

function closeCard() {
  const card = document.getElementById('greetingCard');
  const lid = document.getElementById('lid');
  const clickText = document.querySelector('.click-text');

  card.classList.add('hidden');
  lid.style.transform = 'rotate(0deg) translate(0, 0)';
  clickText.style.display = 'block'; // show again
}

function showCelebration() {
  confettiCanvas.classList.remove('hidden');
  balloons.classList.remove('hidden');
  lights.classList.remove('hidden');
  banner.classList.remove('hidden');
}

async function listenForBlow() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // @ts-ignore
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    let blowFrames = 0;
    const blowThreshold = 25;
    const requiredFrames = 3;

    // 👇 Show "blow the mic" message
    document.getElementById('micMessage').classList.remove('hidden');

    // 👇 Add delay before we start checking blow detection
    const startListeningAfter = 2000; // 2 seconds

    setTimeout(() => {
      function detect() {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // console.log("Volume:", volume); // Debug if needed

        if (volume > blowThreshold) {
          blowFrames++;
        } else {
          blowFrames = Math.max(0, blowFrames - 1);
        }

        if (blowFrames > requiredFrames && flame.style.opacity !== '0') {
          flame.style.opacity = 0;
          flame.style.animation = 'none';
          document.getElementById('micMessage').classList.add('hidden'); // hide msg
          showCelebration();
        } else {
          requestAnimationFrame(detect);
        }
      }

      detect(); // Start detection after delay
    }, startListeningAfter);

  } catch (err) {
    alert('Mic access is needed to blow out the candle!');
    console.error(err);
  }
}

