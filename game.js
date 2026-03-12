const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Адаптивный канвас
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let width = canvas.width;
let height = canvas.height;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
});

// Звуки
const flapSound = document.getElementById("flap");
const scoreSound = document.getElementById("scoreSound");
const hitSound = document.getElementById("hit");

// Спрайты
const birdFrames = [
 "sprites/yellowbird-upflap.png",
 "sprites/yellowbird-midflap.png",
 "sprites/yellowbird-downflap.png"
].map(src => { let img = new Image(); img.src = src; return img; });

const pipeImg = new Image(); pipeImg.src = "sprites/pipe-green.png";
const groundImg = new Image(); groundImg.src = "sprites/base.png";
const bgImg = new Image(); bgImg.src = "sprites/background-day.png";

// GAME STATE
let gameOver = false;
let score = 0;
let best = localStorage.getItem("best") || 0;
let frame = 0;

// Птица
let bird = {
 x: width * 0.25,
 y: height / 2,
 velocity: 0,
 gravity: 0.25,
 lift: -6,
 radius: 18,
 maxFallSpeed: 10
};

// Параметры труб
let pipes = [];
let pipeWidth = width * 0.15;
let gap = height * 0.3;
let pipeSpeed = 2.5;   // начальная скорость труб
let speedIncrement = 0.05; // на сколько растёт скорость

let groundX = 0;

// INPUT
document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

function flap(){
 if(gameOver){ resetGame(); return; }
 bird.velocity = bird.lift;
 flapSound.currentTime = 0; flapSound.play();
}

// RESET
function resetGame(){
 bird.y = height / 2; bird.velocity = 0;
 pipes = []; score = 0; frame = 0;
 pipeSpeed = 2.5; // сброс скорости
 gameOver = false;
}

// BACKGROUND
function drawSky(){ ctx.drawImage(bgImg,0,0,width,height); }

// BIRD
function drawBird(){
 let frameIndex = Math.floor(frame / 8) % 3;
 let img = birdFrames[frameIndex];
 ctx.save();
 ctx.translate(bird.x,bird.y);
 ctx.rotate(bird.velocity * 0.05);
 ctx.drawImage(img,-img.width/2,-img.height/2);
 ctx.restore();
}

// PIPES
function spawnPipe(){
 let topHeight = Math.random()*(height*0.6)+50;
 pipes.push({ x: width, top: topHeight, bottom: topHeight+gap, passed:false });
}

function drawPipes(){
 if(frame % 100 === 0) spawnPipe();

 for(let i=0;i<pipes.length;i++){
  let p = pipes[i];
  p.x -= pipeSpeed;

  ctx.drawImage(pipeImg, p.x, p.top - pipeImg.height, pipeWidth, pipeImg.height);

  ctx.save();
  ctx.translate(p.x+pipeWidth, p.bottom);
  ctx.scale(-1,1);
  ctx.drawImage(pipeImg,0,0,pipeWidth,pipeImg.height);
  ctx.restore();

  // столкновение
  if(bird.x+bird.radius>p.x && bird.x-bird.radius<p.x+pipeWidth &&
     (bird.y-bird.radius<p.top || bird.y+bird.radius>p.bottom)){
      gameOver=true;
      hitSound.currentTime=0; hitSound.play();
  }

  // счёт
  if(!p.passed && p.x+pipeWidth<bird.x){
   score++; p.passed=true;
   scoreSound.currentTime=0; scoreSound.play();
   pipeSpeed += speedIncrement; // скорость растёт с каждым очком
   if(score>best){ best=score; localStorage.setItem("best",best); }
  }
 }
}

// GROUND
function drawGround(){
 groundX -= pipeSpeed;
 if(groundX <= -width) groundX = 0;
 ctx.drawImage(groundImg,groundX,height-80,width,80);
 ctx.drawImage(groundImg,groundX+width,height-80,width,80);
}

// SCORE
function drawScore(){
 ctx.fillStyle="white";
 ctx.font=`bold ${Math.floor(width*0.12)}px Arial`;
 ctx.textAlign="center";
 ctx.fillText(score,width/2,height*0.13);
 ctx.font=`${Math.floor(width*0.03)}px Arial`;
 ctx.fillText("BEST: "+best,width/2,height*0.18);
}

// PHYSICS
function physics(){
 bird.velocity += bird.gravity;
 if(bird.velocity>bird.maxFallSpeed) bird.velocity=bird.maxFallSpeed;
 bird.y += bird.velocity;

 if(bird.y+bird.radius>height-80){ bird.y=height-80-bird.radius; bird.velocity=0; gameOver=true; hitSound.currentTime=0; hitSound.play(); }
 if(bird.y-bird.radius<0){ bird.y=bird.radius; bird.velocity=0; }
}

// GAME OVER
function drawGameOver(){
 ctx.fillStyle="black";
 ctx.font=`${Math.floor(width*0.08)}px Arial`;
 ctx.textAlign="center";
 ctx.fillText("GAME OVER",width/2,height/2);
 ctx.font=`${Math.floor(width*0.04)}px Arial`;
 ctx.fillText("Tap to restart",width/2,height/2+height*0.06);
}

// MAIN LOOP
function update(){
 ctx.clearRect(0,0,width,height);

 drawSky();
 if(!gameOver) physics();
 drawPipes();
 drawBird();
 drawGround();
 drawScore();
 if(gameOver) drawGameOver();

 frame++;
 requestAnimationFrame(update);
}

update();
