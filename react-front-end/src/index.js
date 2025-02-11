import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Phaser from 'phaser';
// import configFunction from "./game/intro"
import tracking from "jstracking";
import annyang from "annyang";
import { isListening } from 'annyang';

// const configuration = configFunction()
// const game = new Phaser.Game(configuration);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 300 },
        debug: false
    }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

const timeOut = setTimeout(() => {
  voiceMoverX("")
}, 1000)
// Let's define a command.
var commands = {
  'pause': function() { alert('Game paused!'); },
  'right': function () {
    voiceMoverX("right")
    setTimeout(() => {
      voiceMoverX("")
    }, 1000)
  },
  'left': function () {
    voiceMoverX("left")
    setTimeout(() => {
      voiceMoverX("")
    }, 1000)
  },
  'jump': function () {
    voiceMoverY("up")
    setTimeout(() => {
      voiceMoverY("")
    }, 50)
  },
  'right jump': function () {
    voiceMoverX("right")
    voiceMoverY("up")
    setTimeout(() => {
      voiceMoverX("")
    }, 1300)
    setTimeout(() => {
      voiceMoverY("")
    }, 100)
  },
  'left jump': function () {
    voiceMoverX("left")
    voiceMoverY("up")
    setTimeout(() => {
      voiceMoverX("")
    }, 1300)
    setTimeout(() => {
      voiceMoverY("")
    }, 100)
  },
  'long left': function () {
    voiceMoverX("left")
    setTimeout(() => {
      voiceMoverX("")
    }, 1700)
  },

  'long right': function () {
    voiceMoverX("right")
    setTimeout(() => {
      voiceMoverX("")
    }, 1700)
  },

  'baby right': function () {
    voiceMoverX("right")
    setTimeout(() => {
      voiceMoverX("")
    }, 300)
  },
  'baby left': function () {
    voiceMoverX("left")
    setTimeout(() => {
      voiceMoverX("")
    }, 300)
  }
};

// Add our commands to annyang
annyang.addCommands(commands);

const pauseVoice = function () {
  annyang.pause();
}

// Start listening.
const startVoice = function() {
  annyang.start();
}


const game = new Phaser.Game(config);

let cursors;
let player;
let stars;
let bombs;
let gameOver = false;
let score = 0;
let scoreText;
let movementX;
let movementY;
let voiceMoveX;
let voiceMoveY;
let cameraOn = true;

function preload ()
{

this.load.image('ground', 'assets/platform.png');
this.load.image('sky', 'assets/sky.png');
this.load.image('ground', 'assets/platform.png');
this.load.image('star', 'assets/star.png');
this.load.image('bomb', 'assets/bomb.png');
this.load.spritesheet('dude', 
    '/assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
);
}

const toggleVoice = function () {
  if(annyang.isListening()) {
    console.log("attempting to pause")
    pauseVoice()

  } else {
    annyang.isListening() 
    console.log("attempting to start voice")
    startVoice();
    
  }
}


function create ()
{

this.input.keyboard.on('keydown-M', () => {
  toggleVoice()
}, this);

this.input.keyboard.on('keydown-V', () => {
  console.log("attempting to toggle camera")
  toggleVideo();
}, this);

this.add.image(400, 300, 'sky');

const platforms = this.physics.add.staticGroup();

platforms.create(400, 568, 'ground').setScale(2).refreshBody();

platforms.create(600, 400, 'ground');
platforms.create(50, 250, 'ground');
platforms.create(750, 220, 'ground');

player = this.physics.add.sprite(100, 450, 'dude');

player.setBounce(0.2);
player.setCollideWorldBounds(true);

this.anims.create({
  key: 'right',
  frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
  frameRate: 10,
  repeat: -1
});

this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
});

this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
});

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
});

// bombs = this.physics.add.group({
//   key: 'bomb',
//   repeat: 2,
//   setXY: {x: 12, y: 0, stepX: 200}
// })

//   bombs.children.iterate(function (child) {

//     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

// });

stars.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

});

bombs = this.physics.add.group();

cursors = this.input.keyboard.createCursorKeys();
this.physics.add.collider(player, platforms);
this.physics.add.collider(stars, platforms);
this.physics.add.collider(bombs, platforms);
this.physics.add.overlap(player, stars, collectStar, null, this);

this.physics.add.collider(player, bombs, hitBomb, null, this);

scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
}

function update ()
{
if (gameOver)
{
    //save score and name to database
    //send to game over screen
    return;
}


  if (cursors.left.isDown || movementX==="left" || voiceMoveX==="left")
{
    player.setVelocityX(-160);

    player.anims.play('left', true);
}
else if (cursors.right.isDown || movementX==="right" || voiceMoveX === "right")
{
    player.setVelocityX(160);

    player.anims.play('right', true);
}
else
{
    player.setVelocityX(0);

    player.anims.play('turn');
}

if ((cursors.up.isDown && player.body.touching.down) || (movementY==="up" && player.body.touching.down) || (voiceMoveY==="up" && player.body.touching.down))
{
    player.setVelocityY(-330);
}


}


function collectStar (player, star)
{
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0)
  {
      //  A new batch of stars to collect
      stars.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      let bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-100, 100), 10);
      bomb.allowGravity = false;

  }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}

// Video Functions
const sendMoveX = function(move) {

movementX = move;
}
const sendMoveY = function(move) {

movementY = move;
}

const voiceMoverX = function(move) {
  voiceMoveX = move
}

const voiceMoverY = function (move) {
  voiceMoveY = move
}

const inititializeCamera = function () {
  
}
let video = document.querySelector("#camera")
if (navigator.mediaDevices.getUserMedia) {
navigator.mediaDevices.getUserMedia({ video: true})
.then(function(stream) {
  video.srcObject = stream
  toggleVideo()
})
.catch(function(err) {
  console.log("Something went wrong!")
  console.log(err)
})
}

let canvas = document.getElementById('overlay')
let context = canvas.getContext('2d')

let drawLine = function(ctx, x1, y1, x2, y2) {
context.beginPath()
context.moveTo(x1, y1)
context.lineTo(x2, y2)
context.stroke()
}

let tracker = new tracking.ObjectTracker('face')
tracker.setInitialScale(4)
tracker.setStepSize(2)
tracker.setEdgesDensity(0.1)

tracker.on('track', function(event) {
if (event.data.length === 1) {
  // Clear entire canvas  
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Draw grid lines so we can see control points
  let leftBound = canvas.width / 3
  let rightBound = leftBound * 2
  let upBound = canvas.height / 3
  let downBound = upBound * 2

  context.strokeStyle = '#ff0000';
  drawLine(context, leftBound, 0, leftBound, canvas.height);
  drawLine(context, rightBound, 0, rightBound, canvas.height);
  drawLine(context, 0, upBound, canvas.width, upBound);
  drawLine(context, 0, downBound, canvas.width, downBound);          

  // Find center of face
  let rect = event.data[0]
  let faceX = rect.x + (rect.width / 2)
  let faceY = rect.y + (rect.height / 2)
  
  // Draw square at center of face
  context.lineWidth = 5

  // Draw face bounding box & center point
  context.strokeStyle = '#0000ff'
  context.strokeRect(faceX - 10, faceY - 10, 20, 20)

  // Has face crossed a boundary?

  if (faceX < leftBound) {
    sendMoveX('left')
  } else if (faceX > rightBound) {
    sendMoveX('right')
  } else {
    sendMoveX('neutral')
  }
  if (faceY < upBound) {
    sendMoveY('up')
  } else if (faceY > downBound) {
    sendMoveY('down')
  } else {
    sendMoveY('neutral')
  }
}
})
tracking.track(video, tracker, { camera: true, audio: false})

function toggleVideo () {
  if (cameraOn) {
    const mediaStream = video.srcObject;
    const tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop())
    cameraOn = false;
    console.log("camera is off")
  } else if (navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
    video.srcObject = stream
  })
    console.log("camera is on")
    cameraOn = true;
  }  
}


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
