import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import p5 from 'p5';

const P5Sketch = ({ aiResponse: initialAiResponse, showSpeechBubble: initialShowSpeechBubble, updateLives, handleGameOver }) => {
  const sketchRef = useRef();
  const [showSpeechBubbleState, setShowSpeechBubbleState] = useState(initialShowSpeechBubble);
  const [lastGeneratedResponse, setLastGeneratedResponse] = useState('');
  const [isGameOverScreenVisible, setIsGameOverScreenVisible] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const RESPONSE_DISPLAY_DURATION = 5000; // Display duration in milliseconds
  const SCORE_MILESTONES = useMemo(() => [100, 200, 300, 400, 500], []);

  const submitScore = useCallback(async (score, gameId) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
        (process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/api'
          : 'https://madmonki.es/api');

      const response = await fetch(`${API_BASE_URL}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score, gameId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Score submitted successfully', data);
      return data;
    } catch (error) {
      console.error('Error submitting score:', error.message);
      throw error;
    }
  }, []);

  useEffect(() => {
    const sketch = (p) => {
      let player;
      let playerImg;
      let enemyImgs = [];
      let enemyDeathImg;
      let backgroundImg;
      let bulletImg;
      let serumImg;
      let enemies = [];
      let bullets = [];
      let lasers = []; // Global array for lasers
      let serums = [];
      let score = 0;
      let lives = 3;
      let gameStarted = false;
      let gameOver = false;
      let currentGameId = null;
      let spawnTimer = 0;
      let laserImg;
      let enemySpeedFactor = 0.5;
      let lastShotTime = 0;
      const shootCooldown = 167;
      const spawnInterval = 100;
      let redFlash = false;
      let redFlashTimer = 0;

      p.preload = () => {
        try {
          playerImg = p.loadImage('/images/capt.png');
          for (let i = 1; i <= 8; i++) {
            enemyImgs.push(p.loadImage(`/images/${i}.png`));
          }
          enemyDeathImg = p.loadImage('/images/EDEATH.gif');
          backgroundImg = p.loadImage('/images/BG1.png');
          bulletImg = p.loadImage('/images/BULLET.png');
          serumImg = p.loadImage('/images/serum.png');
          laserImg = p.loadImage('/images/LASER.png');
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(sketchRef.current);
        p.noLoop(); // Start the game loop stopped
        currentGameId = new Date().getTime();
      };

      const resetGame = () => {
        currentGameId = new Date().getTime();
        player = new Player();
        enemies = [];
        bullets = [];
        lasers = []; // Reset lasers
        serums = [];
        score = 0;
        lives = 3;
        updateLives(lives);
        enemySpeedFactor = 0.5;
        gameOver = false;
        setScoreSubmitted(false);
        setLastGeneratedResponse('');
        setShowSpeechBubbleState(false);
        spawnTimer = 0;
        lastShotTime = 0;
        redFlash = false;
        setIsGameOverScreenVisible(false);
        p.loop();
      };

      let nextExtraLifeScore = 1500; // Track the next score milestone for an extra life

      p.draw = () => {
        if (backgroundImg) {
          p.background(backgroundImg);
        } else {
          p.background(0);
        }

        if (redFlash) {
          p.fill(255, 0, 0, 100);
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

        if (gameOver) {
          if (!scoreSubmitted) {
            setScoreSubmitted(true);
            submitScore(score, currentGameId);
            handleGameOver(score);  // Call the parent's handleGameOver function
            setIsGameOverScreenVisible(true);
          }
          p.noLoop(); // Stop the game loop
          return;
        }

        player.update();
        player.show();

        bullets.forEach(bullet => {
          bullet.update();
          bullet.show();
        });

        enemies.forEach(enemy => {
          enemy.update(player);
          enemy.show();
        });

        serums.forEach((serum, i) => {
          serum.update();
          serum.show();
          if (serum.hits(player)) {
            lives++;
            updateLives(lives);
            serums.splice(i, 1);
          }
        });

        lasers.forEach((laser, i) => {
          laser.update();
          laser.show();
          if (laser.offScreen()) {
            lasers.splice(i, 1);
          } else if (laser.hits(player)) {
            redFlash = true;
            redFlashTimer = 10;
            if (lives > 1) {
              lives--;
              updateLives(lives);
              lasers.splice(i, 1);
            } else {
              gameOver = true;
              if (!scoreSubmitted) {
                setScoreSubmitted(true);
                submitScore(score, currentGameId);
              }
              p.noLoop();
            }
          }
        });

        bullets = bullets.filter(bullet => {
          for (let i = enemies.length - 1; i >= 0; i--) {
            if (bullet.hits(enemies[i]) && !enemies[i].isDying) {
              enemies[i].triggerDeath();
              score += 10;
              if (score % 1000 === 0) {
                enemySpeedFactor *= 1.25;
              }

              // Check for extra life at 1500, then every 500 points after that
              if (score >= nextExtraLifeScore) {
                lives++;
                updateLives(lives);
                nextExtraLifeScore += 500; // Set the next milestone to 500 points after the current one
              }

              checkScoreMilestones(score);
              return false;
            }
          }
          return true;
        });

        enemies = enemies.filter(enemy => {
          if (enemy.hits(player)) {
            redFlash = true;
            redFlashTimer = 10;
            if (lives > 0) {
              lives--;
              updateLives(lives);
            }

            if (lives === 0) {
              gameOver = true;
            }
            return false;
          }
          return !enemy.isDead;
        });

        p.fill(255);
        p.textSize(24);
        p.text(`Score: ${score}`, p.width / 2, 30);
        p.text(`Lives: ${lives}`, p.width - 100, 30);

        spawnTimer++;
        if (spawnTimer >= spawnInterval) {
          spawnEnemies();
          spawnTimer = 0;
        }
      };

      p.keyPressed = () => {
        if (!gameStarted && !gameOver && p.keyCode === p.ENTER) {
          console.log("Starting game...");
          gameStarted = true;
          player = new Player();
          resetGame();
        }

        if (gameOver && isGameOverScreenVisible && p.keyCode === p.ENTER) {
          console.log("Starting a new game after game over...");
          resetGame();
        }

        if (gameStarted && player && player.pos) {
          if (p.keyCode === 87 || p.keyCode === p.UP_ARROW) {
            shoot();
          }
        } else {
          console.error("Cannot shoot: Game hasn't started or player isn't ready.");
        }
      };

      p.touchStarted = () => {
        if (gameStarted && player && player.pos) {
          shoot();
        } else {
          console.error("Cannot shoot: Game hasn't started or player isn't ready.");
        }
      };

      p.touchMoved = () => {
        if (gameStarted) {
          player.pos.x = p.mouseX;
        }
        return false;
      };

      const shoot = () => {
        const currentTime = p.millis();
        if (gameStarted && player && player.pos && currentTime - lastShotTime >= shootCooldown) {
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
        const url = isLocal ? process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL : process.env.NEXT_PUBLIC_PRODUCTION_API_URL;

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
                setLastGeneratedResponse(data.response);
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

      const MAX_ENEMIES = 15;

      const spawnEnemies = () => {
        if (enemies.length >= MAX_ENEMIES) {
          return; // Don't spawn new enemies if we've reached the limit
        }

        let cols = 10;
        let enemyWidth = 50;
        let enemyHeight = 50;
        let spacingX = (p.width - cols * enemyWidth) / (cols + 1);
        let y = -enemyHeight / 2;
        let enemiesPerRow = p.floor(p.random(3, 6));
        enemiesPerRow = Math.min(enemiesPerRow, MAX_ENEMIES - enemies.length);

        let availableEnemyTypes = [3, 4];

        if (score >= 50) {
          availableEnemyTypes = availableEnemyTypes.concat([0, 1]);
        }
        if (score >= 100) {
          availableEnemyTypes = availableEnemyTypes.concat([2]);
        }
        if (score >= 150) {
          availableEnemyTypes = availableEnemyTypes.concat([6]);
        }
        if (score >= 200) {
          availableEnemyTypes = availableEnemyTypes.concat([7]);
        }
        if (score >= 250) {
          availableEnemyTypes = availableEnemyTypes.concat([4]);
        }

        let placedColumns = [];
        for (let i = 0; i < enemiesPerRow; i++) {
          let col;
          do {
            col = p.floor(p.random(cols));
          } while (placedColumns.includes(col));

          placedColumns.push(col);
          let x = spacingX + col * (enemyWidth + spacingX) + (enemyWidth / 2);
          let enemyType = p.random(availableEnemyTypes);

          enemies.push(new Enemy(x, y, enemyType));
        }
      };

      const spawnSerum = () => {
        const x = p.random(50, p.width - 50);
        const y = -50;
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
          p.image(playerImg, 0, 0, 36, 69);
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
          p.image(bulletImg, 0, 0, 10, 5);
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
          this.active = true;
        }

        update() {
          if (this.active) {
            this.pos.y += this.speed;
          }
        }

        show() {
          if (this.active) {
            p.push();
            p.translate(this.pos.x, this.pos.y);
            p.imageMode(p.CENTER);
            p.image(laserImg, 0, 0, 48, 9);
            p.pop();
          }
        }

        offScreen() {
          return this.pos.y > p.height || this.pos.y < 0;
        }

        hits(player) {
          if (this.active) {
            let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
            return d < 20;
          }
          return false;
        }

        deactivate() {
          this.active = false;
        }
      }

      class Serum {
        constructor(x, y) {
          this.pos = p.createVector(x, y);
          this.speed = 2;
        }

        update() {
          this.pos.y += this.speed;
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          p.image(serumImg, 0, 0, 24, 35);
          p.pop();
        }

        hits(player) {
          let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
          return d < 20;
        }
      }

      class Enemy {
        constructor(x, y, type) {
          this.pos = p.createVector(x, y);
          this.baseSpeed = 2;
          this.speed = this.baseSpeed * enemySpeedFactor;
          this.type = type;
          this.img = enemyImgs[type];
          this.deathAnimationFrames = 10;
          this.isDying = false;
          this.deathFrameCount = 0;
          this.isDead = false;
          this.homingTypes = [1, 5, 7];
          this.movementDirection = p.random() > 0.5 ? 1 : -1;
          this.moveCounter = 0;

          if (type === 5) {
            this.speed *= 1.25;
          } else if (type === 7) {
            this.speed *= 0.75;
          } else if (type === 1) {
            this.speed *= 1.25;
          }

          if (type === 1) {
            this.moveRight = true;
            this.moveCounter = 0;
          }

          if (type === 6) {
            this.shootInterval = p.floor(p.random(80, 120));
            this.shootTimer = p.floor(p.random(0, this.shootInterval));
          }

          if (type === 2) {
            this.movementInterval = 30;
            this.movementTimer = 0;
          }
        }

        update(player) {
          if (this.isDying) {
            this.deathFrameCount++;
            if (this.deathFrameCount >= this.deathAnimationFrames) {
              this.isDead = true;
            }
          } else {
            this.speed = this.baseSpeed * enemySpeedFactor;

            if (this.homingTypes.includes(this.type)) {
              let direction = p5.Vector.sub(player.pos, this.pos);
              direction.setMag(this.speed);
              this.pos.add(direction);
            } else {
              this.pos.y += this.speed;

              if (this.type === 1) {
                if (this.moveCounter >= 20) {
                  this.moveRight = !this.moveRight;
                  this.moveCounter = 0;
                }
                this.pos.x += this.moveRight ? this.speed : -this.speed;
                this.moveCounter++;
              }

              if (this.type === 2) {
                this.movementTimer++;
                if (this.movementTimer >= this.movementInterval) {
                  this.movementDirection = p.random() > 0.5 ? 1 : -1;
                  this.pos.x += this.movementDirection * this.speed * 10;
                  this.movementTimer = 0;
                }
              }

              if (this.type === 0) {
                this.pos.x += this.movementDirection * this.speed;
                if (p.random() < 0.01) {
                  this.movementDirection *= -1;
                }
              }

              if (this.type === 6) {
                this.shootTimer++;
                if (this.shootTimer >= this.shootInterval) {
                  this.shoot();
                  this.shootTimer = 0;
                  this.shootInterval = p.floor(p.random(80, 120));
                }
              }

              if (this.pos.y > p.height) {
                this.pos.y = -50;
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
        }

        shoot() {
          if (this.type === 6) {
            lasers.push(new Laser(this.pos.x, this.pos.y, 5)); // Add laser to global array
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
  }, [updateLives, scoreSubmitted, SCORE_MILESTONES, submitScore]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '25vh', backgroundColor: 'transparent' }}>
      <div ref={sketchRef} style={{ width: '800px', height: '600px', position: 'relative', backgroundColor: 'transparent' }}>
        {isGameOverScreenVisible && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontSize: '24px',
          }}>
            <h2>Game Over</h2>
            <p>Your score: {score}</p>
            <p>Press ENTER to play again</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default P5Sketch;
