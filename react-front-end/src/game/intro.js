import Phaser from "phaser";
import tracking from "jstracking";
import annyang from "annyang";
// this.load.setBaseURL('http://labs.phaser.io');


export default function configFunction(){
  return {
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
  }
};

let cursors;
let player;
let stars;
let bombs;
let gameOver = false;
let score = 0;
let scoreText;
let movementX;
let movementY;

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

function create ()
{
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
      return;
  }

    if (cursors.left.isDown || movementX=="left")
  {
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursors.right.isDown || movementX=="right")
  {
      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if ((cursors.up.isDown && player.body.touching.down) || (movementY=="up" && player.body.touching.down))
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
var sendMoveX = function(move) {
  console.log(move);
  movementX = move;
}
var sendMoveY = function(move) {
  console.log(move);
  movementY = move;
}

var video = document.querySelector("#camera")
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    video.srcObject = stream
  })
  .catch(function(err) {
    console.log("Something went wrong!")
  })
}

var canvas = document.getElementById('overlay')
var context = canvas.getContext('2d')

var drawLine = function(ctx, x1, y1, x2, y2) {
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
}

var tracker = new tracking.ObjectTracker('face')
tracker.setInitialScale(4)
tracker.setStepSize(2)
tracker.setEdgesDensity(0.1)

tracker.on('track', function(event) {
  if (event.data.length == 1) {
    // Clear entire canvas  
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines so we can see control points
    var leftBound = canvas.width / 3
    var rightBound = leftBound * 2
    var upBound = canvas.height / 3
    var downBound = upBound * 2

    context.strokeStyle = '#ff0000';
    drawLine(context, leftBound, 0, leftBound, canvas.height);
    drawLine(context, rightBound, 0, rightBound, canvas.height);
    drawLine(context, 0, upBound, canvas.width, upBound);
    drawLine(context, 0, downBound, canvas.width, downBound);          

    // Find center of face
    var rect = event.data[0]
    var faceX = rect.x + (rect.width / 2)
    var faceY = rect.y + (rect.height / 2)
    
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
tracking.track(video, tracker, { camera: true })

if (annyang) {
  // Let's define a command.
  var commands = {
    'hello': function() { alert('Hello world!'); }
  };
 
  // Add our commands to annyang
  annyang.addCommands(commands);
 
  // Start listening.
  annyang.start();
}
