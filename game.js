const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

/* SPRITES */

const birdFrames = [
 "sprites/yellowbird-upflap.png",
 "sprites/yellowbird-midflap.png",
 "sprites/yellowbird-downflap.png"
].map(src=>{
 let img = new Image();
 img.src = src;
 return img;
});

const pipeImg = new Image();
pipeImg.src = "sprites/pipe-green.png";

const groundImg = new Image();
groundImg.src = "sprites/base.png";

const bgImg = new Image();
bgImg.src = "sprites/background-day.png";

/* GAME STATE */

let gameOver = false;
let score = 0;
let best = localStorage.getItem("best") || 0;

let frame = 0;

let bird = {
 x:100,
 y:250,
 velocity:0,
 gravity:0.5,
 lift:-9,
 radius:18
};

let pipes = [];
let pipeWidth = 70;
let gap = 160;

let groundX = 0;

/* INPUT */

document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

function flap(){

 if(gameOver){
  resetGame();
  return;
 }

 bird.velocity = bird.lift;
}

/* RESET */

function resetGame(){

 bird.y = 250;
 bird.velocity = 0;

 pipes = [];
 score = 0;
 frame = 0;

 gameOver = false;
}

/* BACKGROUND */

function drawSky(){
 ctx.drawImage(bgImg,0,0,width,height);
}

/* BIRD */

function drawBird(){

 let frameIndex = Math.floor(frame/8)%3;
 let img = birdFrames[frameIndex];

 ctx.save();

 ctx.translate(bird.x,bird.y);

 let angle = bird.velocity * 0.05;
 ctx.rotate(angle);

 ctx.drawImage(
  img,
  -img.width/2,
  -img.height/2
 );

 ctx.restore();
}

/* PIPES */

function spawnPipe(){

 let topHeight = Math.random()*250 + 50;

 pipes.push({
  x:width,
  top:topHeight,
  bottom:topHeight + gap,
  passed:false
 });

}

function drawPipes(){

 if(frame % 100 === 0){
  spawnPipe();
 }

 for(let i=0;i<pipes.length;i++){

  let p = pipes[i];

  p.x -= 2.5;

  ctx.drawImage(
   pipeImg,
   p.x,
   p.top - pipeImg.height,
   pipeWidth,
   pipeImg.height
  );

  ctx.save();
  ctx.translate(p.x + pipeWidth, p.bottom);
  ctx.scale(-1,1);

  ctx.drawImage(
   pipeImg,
   0,
   0,
   pipeWidth,
   pipeImg.height
  );

  ctx.restore();

  if(
   bird.x + bird.radius > p.x &&
   bird.x - bird.radius < p.x + pipeWidth &&
   (
    bird.y - bird.radius < p.top ||
    bird.y + bird.radius > p.bottom
   )
  ){
   gameOver = true;
  }

  if(!p.passed && p.x + pipeWidth < bird.x){
   score++;
   p.passed = true;

   if(score > best){
    best = score;
    localStorage.setItem("best",best);
   }
  }

 }

}

/* GROUND */

function drawGround(){

 groundX -= 2;

 if(groundX <= -width){
  groundX = 0;
 }

 ctx.drawImage(groundImg,groundX,height-80,width,80);
 ctx.drawImage(groundImg,groundX+width,height-80,width,80);

}

/* SCORE */

function drawScore(){

 ctx.fillStyle="white";
 ctx.font="bold 50px Arial";
 ctx.textAlign="center";

 ctx.fillText(score,width/2,80);

 ctx.font="20px Arial";
 ctx.fillText("BEST: "+best,width/2,110);
}

/* PHYSICS */

function physics(){

 bird.velocity += bird.gravity;
 bird.y += bird.velocity;

 if(bird.y + bird.radius > height-80){
  gameOver = true;
 }

 if(bird.y < 0){
  bird.y = 0;
 }

}

/* GAME OVER */

function drawGameOver(){

 ctx.fillStyle="black";
 ctx.font="40px Arial";
 ctx.textAlign="center";

 ctx.fillText("GAME OVER",width/2,height/2);

 ctx.font="20px Arial";
 ctx.fillText("Tap to restart",width/2,height/2+40);

}

/* LOOP */

function update(){

 ctx.clearRect(0,0,width,height);

 drawSky();

 if(!gameOver){
  physics();
 }

 drawPipes();
 drawBird();
 drawGround();
 drawScore();

 if(gameOver){
  drawGameOver();
 }

 frame++;

 requestAnimationFrame(update);
}

update();
