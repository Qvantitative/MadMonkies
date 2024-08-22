import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const P5Sketch = ({ aiResponse: initialAiResponse, showSpeechBubble: initialShowSpeechBubble, updateLives }) => {
  const sketchRef = useRef();
  const [aiResponseState, setAiResponseState] = useState(initialAiResponse);
  const [showSpeechBubbleState, setShowSpeechBubbleState] = useState(initialShowSpeechBubble);
  const [lastGeneratedResponse, setLastGeneratedResponse] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const RESPONSE_DISPLAY_DURATION = 5000; // Display duration in milliseconds
  const SCORE_MILESTONES = [100, 200, 300, 400, 500]; // Define your score milestones

  useEffect(() => {
    const sketch = (p) => {
      let player;
      let playerImg;
      let enemyImgs = [];
      let enemyDeathImg;
      let backgroundImg;
      let bulletImg;
      let serumImg; // Declare serum image
      let enemies = [];
      let bullets = [];
      let serums = []; // Array to hold serums
      let score = 0;
      let lives = 3; // Player starts with three lives
      let gameStarted = false;
      let gameOver = false;
      let currentGameId = null;
      let spawnTimer = 0;
      let laserImg; // Declare laser image
      let enemySpeedFactor = 0.5; // Initial enemy speed factor (50% slower)
      let lastShotTime = 0; // Track the last time the player shot
      const shootCooldown = 167; // Cooldown time in milliseconds (3x faster shooting rate)
      const spawnInterval = 100; // Spawn a new row of enemies every 100 frames
      let redFlash = false; // Flag for red flash effect
      let redFlashTimer = 0; // Timer for red flash effect

      p.preload = () => {
        try {
          playerImg = p.loadImage('/images/capt.png');
          for (let i = 1; i <= 8; i++) {
            enemyImgs.push(p.loadImage(`/images/${i}.png`));
          }
          enemyDeathImg = p.loadImage('/images/EDEATH.gif');
          backgroundImg = p.loadImage('/images/BG1.png');
          bulletImg = p.loadImage('/images/BULLET.png');
          serumImg = p.loadImage('/images/serum.png'); // Preload serum image
          laserImg = p.loadImage('/images/LASER.png'); // Preload laser image
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(sketchRef.current);
        resetGame();
      };

      const resetGame = () => {
        currentGameId = new Date().getTime();
        player = new Player();
        enemies = [];
        bullets = [];
        serums = []; // Reset serums
        score = 0;
        lives = 3; // Reset lives to 3
        updateLives(lives); // Update lives in parent component
        enemySpeedFactor = 0.5; // Reset speed factor
        gameOver = false;
        setScoreSubmitted(false);
        setAiResponseState('');
        setLastGeneratedResponse(''); // Clear last generated response
        setShowSpeechBubbleState(false);
        spawnTimer = 0; // Reset spawn timer
        lastShotTime = 0; // Reset last shot time
        redFlash = false; // Reset red flash flag
        p.loop();
      };

      p.draw = () => {
        if (backgroundImg) {
          p.background(backgroundImg);
        } else {
          p.background(0);
        }

        if (redFlash) {
          p.fill(255, 0, 0, 100); // Red color with transparency
          p.rect(0, 0, p.width, p.height);
          redFlashTimer--;
          if (redFlashTimer <= 0) {
            redFlash = false;
          }
        }

        if (!gameStarted) {
          p.fill(255);
          p.textSize(64);
          p.textAlign(p.CENTER);
          p.text('Press ENTER', p.width / 2, p.height / 2);
          return;
        }

        player.update();
        player.show();

        for (let bullet of bullets) {
          bullet.update();
          bullet.show();
        }

        for (let enemy of enemies) {
          enemy.update(player); // Pass the player to the enemy update method
          enemy.show();
        }

        for (let serum of serums) {
          serum.update();
          serum.show();
          if (serum.hits(player)) {
            lives++; // Player gains an extra life
            updateLives(lives); // Update lives in parent component
            serums.splice(serums.indexOf(serum), 1); // Remove the collected serum
          }
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
          for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].hits(enemies[j]) && !enemies[j].isDying) {
              enemies[j].triggerDeath(); // Trigger the enemy's death animation
              bullets.splice(i, 1); // Remove the bullet that hit the enemy
              score += 10;
              if (score % 1000 === 0) {
                enemySpeedFactor *= 1.25; // Increase speed by 15% for every 1000 points
              }
              if (score % 1500 === 0) {
                spawnSerum(); // Spawn a serum every 1500 points
              }
              checkScoreMilestones(score);
              break;
            }
          }
        }

        for (let enemy of enemies) {
          if (enemy.hits(player)) {
            redFlash = true; // Trigger red flash effect
            redFlashTimer = 10; // Duration of the red flash effect
            if (lives > 1) {
              lives--; // Use a life
              updateLives(lives); // Update lives in parent component
              enemies.splice(enemies.indexOf(enemy), 1); // Remove the enemy that hit the player
            } else {
              gameOver = true;
              if (!scoreSubmitted) {
                setScoreSubmitted(true);
                submitScore(score, currentGameId);
              }
              p.noLoop();
            }
          }
        }

        p.fill(255);
        p.textSize(24);
        p.text(`Score: ${score}`, p.width / 2, 30);
        p.text(`Lives: ${lives}`, p.width - 100, 30); // Display lives

        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
          spawnEnemies();
          spawnTimer = 0;
        }

        // Filter out enemies that are off-screen or dead
        enemies = enemies.filter(enemy => enemy.pos.y <= p.height + 50 && !enemy.isDead);
      };


      p.keyPressed = () => {
        if (!gameStarted && p.keyCode === p.ENTER) {
          gameStarted = true;
        }
        if (gameOver && p.keyCode === p.ENTER) {
          resetGame();
        }
        if (p.keyCode === 87 || p.keyCode === p.UP_ARROW) { // 'W' key or 'UP_ARROW'
          shoot();
        }
      };

      p.touchStarted = () => {
        if (!gameStarted) {
          gameStarted = true;
        } else if (gameOver) {
          resetGame();
        } else {
          shoot();
        }
      };

      p.touchMoved = () => {
        if (gameStarted) {
          player.pos.x = p.mouseX;
        }
        return false; // Prevent default
      };

      const shoot = () => {
        const currentTime = p.millis();
        if (currentTime - lastShotTime >= shootCooldown) {
          // Adjust the bullet start position to be in front of the player
          bullets.push(new Bullet(player.pos.x, player.pos.y - 35));
          lastShotTime = currentTime;
        }
      };

      const checkScoreMilestones = (currentScore) => {
        if (SCORE_MILESTONES.includes(currentScore)) {
          generateAiResponse(currentScore, currentGameId);
        }
      };

      const generateAiResponse = (score, gameId) => {
        const isLocal = window.location.hostname === 'localhost';
        const url = isLocal ? 'http://localhost:3000/api/score-response' : 'https://mad-monkies-qvantitative-mad-monkies-45e37806.vercel.app/api/score-response';

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score }),
        })
        .then(response => response.json())
        .then(data => {
          if (gameId === currentGameId) { // Ensure response is not shown if a new game has started
            if (gameOver) { // Only show the speech bubble if the game is over
              setLastGeneratedResponse(data.response);
              setAiResponseState(data.response);
              setShowSpeechBubbleState(true);
              setTimeout(() => {
                setShowSpeechBubbleState(false);
              }, RESPONSE_DISPLAY_DURATION);
            }
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      };

// ... other code ...

const submitScore = (score, gameId) => {
  const isLocal = window.location.hostname === 'localhost';
  const url = isLocal ? 'http://localhost:3000/api/score-response' : 'https://your-vercel-deployment-url/api/score-response';

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  })
  .then(response => response.json())
  .then(data => {
    if (gameId === currentGameId) {
      if (gameOver) {
        setAiResponseState(data.response);
        setShowSpeechBubbleState(true);
        setTimeout(() => {
          setShowSpeechBubbleState(false);
        }, RESPONSE_DISPLAY_DURATION);
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

  fetch('/api/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Player', score }),
  });
};

      const spawnEnemies = () => {
        let cols = 10; // Number of columns
        let enemyWidth = 50;
        let enemyHeight = 50;
        let spacingX = (p.width - cols * enemyWidth) / (cols + 1); // Ensure spacing covers entire width
        let y = -enemyHeight / 2; // Start above the screen
        let enemiesPerRow = p.floor(p.random(3, 6)); // Random number of enemies per row

        let availableEnemyTypes = [3, 4]; // Initial enemy types (4.png and 5.png)

        if (score >= 750) {
          availableEnemyTypes = availableEnemyTypes.concat([0, 1]); // Add 1.png and 2.png
        }
        if (score >= 1500) {
          availableEnemyTypes = availableEnemyTypes.concat([2]); // Add 3.png
        }
        if (score >= 2000) {
          availableEnemyTypes = availableEnemyTypes.concat([6]); // Add 7.png
        }
        if (score >= 2500) {
          availableEnemyTypes = availableEnemyTypes.concat([7]); // Add 8.png
        }
        if (score >= 3000) {
          availableEnemyTypes = availableEnemyTypes.concat([4]); // Add 5.png again
        }

        let placedColumns = [];
        for (let i = 0; i < enemiesPerRow; i++) {
          let col;
          do {
            col = p.floor(p.random(cols)); // Randomly choose a column
          } while (placedColumns.includes(col)); // Ensure no duplicate columns in the same row

          placedColumns.push(col);
          let x = spacingX + col * (enemyWidth + spacingX) + (enemyWidth / 2);
          let enemyType = p.random(availableEnemyTypes); // Randomly choose an available enemy type

          enemies.push(new Enemy(x, y, enemyType));
        }
      };

      const spawnSerum = () => {
        const x = p.random(50, p.width - 50);
        const y = -50; // Start above the screen
        serums.push(new Serum(x, y));
      };

      class Player {
        constructor() {
          this.pos = p.createVector(p.width / 2, p.height - 50);
          this.speed = 5;
        }

        update() {
          let moveVector = p.createVector(0, 0);

          if (p.keyIsDown(65) || p.keyIsDown(p.LEFT_ARROW)) {
            moveVector.x -= this.speed;
          }
          if (p.keyIsDown(68) || p.keyIsDown(p.RIGHT_ARROW)) {
            moveVector.x += this.speed;
          }

          if (moveVector.mag() > 0) {
            moveVector.setMag(this.speed);
            const newPos = p5.Vector.add(this.pos, moveVector);
            if (newPos.x >= 0 && newPos.x <= p.width) {
              this.pos = newPos;
            }
          }
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          p.image(playerImg, 0, 0, 36, 69); // Reduced size to 36x69
          p.pop();
        }
      }

      class Bullet {
        constructor(x, y) {
          this.pos = p.createVector(x, y);
          this.angle = -p.HALF_PI;
          this.speed = 10;
        }

        update() {
          this.pos.x += this.speed * p.cos(this.angle);
          this.pos.y += this.speed * p.sin(this.angle);
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.rotate(this.angle);
          p.imageMode(p.CENTER);
          p.image(bulletImg, 0, 0, 10, 5); // Adjust size as necessary
          p.pop();
        }

        hits(enemy) {
          let d = p.dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
          return d < 20;
        }
      }

      class Laser {
        constructor(x, y, speed) {
          this.pos = p.createVector(x, y);
          this.speed = speed;
          this.active = true; // Laser is active when created
        }

        update() {
          if (this.active) {
            this.pos.y += this.speed; // Move downwards
          }
        }

        show() {
          if (this.active) {
            p.push();
            p.translate(this.pos.x, this.pos.y);
            p.imageMode(p.CENTER);
            p.image(laserImg, 0, 0, 48, 9); // Adjust size as necessary
            p.pop();
          }
        }

        offScreen() {
          return this.pos.y > p.height || this.pos.y < 0;
        }

        hits(player) {
          if (this.active) {
            let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
            return d < 20; // Adjust collision radius as necessary
          }
          return false;
        }

        deactivate() {
          this.active = false; // Deactivate the laser
        }
      }

      class Serum {
        constructor(x, y) {
          this.pos = p.createVector(x, y);
          this.speed = 2; // Speed of the serum
        }

        update() {
          this.pos.y += this.speed; // Move downwards
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          p.image(serumImg, 0, 0, 24, 35); // Adjust size as necessary
          p.pop();
        }

        hits(player) {
          let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
          return d < 20; // Adjust collision radius as necessary
        }
      }

      class Enemy {
        constructor(x, y, type) {
          this.pos = p.createVector(x, y);
          this.baseSpeed = 2; // Base speed for enemies
          this.speed = this.baseSpeed * enemySpeedFactor; // Adjust speed based on the enemySpeedFactor
          this.type = type; // Store the type
          this.img = enemyImgs[type]; // Use the provided type to select the image
          this.deathAnimationFrames = 10; // Set the number of frames for the death animation
          this.isDying = false;
          this.deathFrameCount = 0;
          this.isDead = false; // Add an isDead flag
          this.homingTypes = [1, 5, 7]; // Indices for 2.png, 6.png, and 8.png (adjust as necessary)
          this.lasers = []; // Array to hold lasers
          this.movementDirection = p.random() > 0.5 ? 1 : -1; // Random initial direction for 1.png
          this.moveCounter = 0; // Counter for controlling movement interval

          // Adjust speed for specific enemy types
          if (type === 5) { // Assuming 6.png is at index 5
            this.speed *= 1.25; // 25% faster
          } else if (type === 7) { // Assuming 8.png is at index 7
            this.speed *= 0.75; // 25% slower
          } else if (type === 1) { // Assuming 2.png is at index 1
            this.speed *= 1.25; // 25% faster
          }

          // Special movement logic for 2.png
          if (type === 1) { // Assuming 2.png is at index 1
            this.moveRight = true;
            this.moveCounter = 0;
          }

          // Shooting variables for 7.png
          if (type === 6) { // Assuming 7.png is at index 6
            this.shootInterval = p.floor(p.random(80, 120)); // Interval between shots, randomized
            this.shootTimer = p.floor(p.random(0, this.shootInterval)); // Start with a random timer value
          }

          // Movement interval for 3.png
          if (type === 2) { // Assuming 3.png is at index 2
            this.movementInterval = 30; // Interval for changing direction
            this.movementTimer = 0; // Timer for controlling movement
          }
        }

        update(player) {
          if (this.isDying) {
            this.deathFrameCount++;
            if (this.deathFrameCount >= this.deathAnimationFrames) {
              this.isDead = true; // Mark the enemy as dead
            }
          } else {
            this.speed = this.baseSpeed * enemySpeedFactor; // Update speed based on the enemySpeedFactor

            // Adjust speed for specific enemy types
            if (this.type === 5) { // Assuming 6.png is at index 5
              this.speed *= 1.25; // 25% faster
            } else if (this.type === 7) { // Assuming 8.png is at index 7
              this.speed *= 0.75; // 25% slower
            } else if (this.type === 1) { // Assuming 2.png is at index 1
              this.speed *= 1.25; // 25% faster
            }

            if (this.homingTypes.includes(this.type)) { // Check if the enemy is a homing type
              // Calculate direction towards player
              let direction = p5.Vector.sub(player.pos, this.pos);
              direction.setMag(this.speed);
              this.pos.add(direction);
            } else {
              // Normal behavior for other enemies
              this.pos.y += this.speed;

              // Special movement logic for 2.png
              if (this.type === 1) { // Assuming 2.png is at index 1
                if (this.moveCounter >= 20) { // 20 frames to move right or left
                  this.moveRight = !this.moveRight; // Switch direction
                  this.moveCounter = 0;
                }
                this.pos.x += this.moveRight ? this.speed : -this.speed;
                this.moveCounter++;
              }

              // Random movement logic for 3.png
              if (this.type === 2) { // Assuming 3.png is at index 2
                this.movementTimer++;
                if (this.movementTimer >= this.movementInterval) {
                  this.movementDirection = p.random() > 0.5 ? 1 : -1;
                  this.pos.x += this.movementDirection * this.speed * 10; // Move by blocks of 10 pixels
                  this.movementTimer = 0;
                }
              }

              // Random movement logic for 1.png
              if (this.type === 0) { // Assuming 1.png is at index 0
                this.pos.x += this.movementDirection * this.speed;
                // Change direction randomly
                if (p.random() < 0.01) {
                  this.movementDirection *= -1;
                }
              }

              if (this.type === 6) { // Only apply shooting logic to 7.png
                this.shootTimer++;
                if (this.shootTimer >= this.shootInterval) {
                  this.shoot();
                  this.shootTimer = 0;
                  this.shootInterval = p.floor(p.random(80, 120)); // Randomize the interval for the next shot
                }
              }

              if (this.pos.y > p.height) {
                this.pos.y = -50; // Reset to the top when it reaches the bottom
              }
            }
          }

          // Update lasers for all enemies, even if they are dead
          for (let i = this.lasers.length - 1; i >= 0; i--) {
            if (this.lasers[i]) {
              this.lasers[i].update();
              if (this.lasers[i].offScreen()) {
                this.lasers.splice(i, 1); // Remove laser if it's off screen
              } else if (this.lasers[i].hits(player)) {
                // Handle player hit logic here
                if (lives > 1) {
                  lives--; // Use a life
                  updateLives(lives); // Update lives in parent component
                  this.lasers.splice(i, 1); // Remove the laser that hit the player
                } else {
                  gameOver = true;
                  if (!scoreSubmitted) {
                    setScoreSubmitted(true);
                    submitScore(score, currentGameId);
                  }
                  p.noLoop();
                }
              }
            }
          }
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          if (this.isDying) {
            p.image(enemyDeathImg, 0, 0, 50, 50);
          } else {
            p.image(this.img, 0, 0, 48, 48);
          }
          p.pop();

          // Show lasers for all enemies, even if they are dead
          for (let laser of this.lasers) {
            laser.show();
          }
        }

        shoot() {
          if (this.type === 6) { // Only allow shooting for 7.png
            this.lasers.push(new Laser(this.pos.x, this.pos.y, 5)); // Adjust laser speed as necessary
          }
        }

        hits(player) {
          let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
          return d < 40;
        }

        triggerDeath() {
          this.isDying = true;
          this.deathFrameCount = 0;
        }
      }
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, [updateLives]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '25vh', backgroundColor: 'transparent' }}>
      <div ref={sketchRef} style={{ width: '800px', height: '600px', position: 'relative', backgroundColor: 'transparent' }}>
        {showSpeechBubbleState && (
          <div className="speech-bubble" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: showSpeechBubbleState ? 1 : 0 }}>
            {aiResponseState}
          </div>
        )}
      </div>
    </div>
  );
};

export default P5Sketch;
