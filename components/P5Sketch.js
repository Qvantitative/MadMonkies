import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const P5Sketch = ({ aiResponse: initialAiResponse, showSpeechBubble: initialShowSpeechBubble }) => {
  const sketchRef = useRef();
  const [aiResponseState, setAiResponseState] = useState(initialAiResponse);
  const [showSpeechBubbleState, setShowSpeechBubbleState] = useState(initialShowSpeechBubble);
  const RESPONSE_DISPLAY_DURATION = 5000; // Display duration in milliseconds

  // Initialize P5 sketch
  useEffect(() => {
    const sketch = (p) => {
      let player;
      let playerImg;
      let enemyImgs = [];
      let backgroundImg;
      let enemies = [];
      let bullets = [];
      let score = 0;
      let gameStarted = false;
      let gameOver = false;

      p.preload = () => {
        try {
          playerImg = p.loadImage('/capt.png');
          for (let i = 1; i <= 10; i++) {
            enemyImgs.push(p.loadImage(`/${i}.png`));
          }
          backgroundImg = p.loadImage('/background.png');
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(sketchRef.current);
        resetGame();
      };

      const resetGame = () => {
        player = new Player();
        enemies = [];
        bullets = [];
        score = 0;
        gameOver = false;
        setAiResponseState('');
        setShowSpeechBubbleState(false);
        for (let i = 0; i < 20; i++) {
          enemies.push(new Enemy());
        }
        p.loop();
      };

      p.draw = () => {
        p.background(backgroundImg);

        if (!gameStarted) {
          p.fill(255);
          p.textSize(64);
          p.textAlign(p.CENTER);
          p.text('Press ENTER to Start', p.width / 2, p.height / 2);
          return;
        }

        player.update();
        player.show();

        for (let bullet of bullets) {
          bullet.update();
          bullet.show();
        }

        for (let enemy of enemies) {
          enemy.update();
          enemy.show();
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
          for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].hits(enemies[j])) {
              bullets.splice(i, 1);
              enemies.splice(j, 1);
              score += 10;
              enemies.push(new Enemy());
              break;
            }
          }
        }

        for (let enemy of enemies) {
          if (enemy.hits(player)) {
            gameOver = true;
            p.noLoop();
            submitScore(score); // Call submitScore when the game is over
          }
        }

        p.fill(255);
        p.textSize(24);
        p.text(`Score: ${score}`, p.width / 2, 30);

        if (showSpeechBubbleState) {
          p.fill(0, 0, 0, 200);
          p.rectMode(p.CENTER);
          p.rect(p.width / 2, p.height / 2, 400, 200, 10);
          p.fill(255);
          p.textSize(16);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(aiResponseState, p.width / 2, p.height / 2);
        }
      };

      p.keyPressed = () => {
        if (!gameStarted && p.keyCode === p.ENTER) {
          gameStarted = true;
        }
        if (gameOver && p.keyCode === p.ENTER) {
          resetGame();
        }
      };

      p.mousePressed = () => {
        if (gameStarted && !gameOver) {
          shootBurst();
        }
      };

      const shootBurst = () => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            bullets.push(new Bullet(player.pos.x, player.pos.y));
          }, i * 100);
        }
      };

      const submitScore = (score) => {
        fetch('http://localhost:3000/api/score-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score }),
        })
        .then(response => response.json())
        .then(data => {
          setAiResponseState(data.response);
          setShowSpeechBubbleState(true);
          // Hide the speech bubble after a delay
          setTimeout(() => {
            setShowSpeechBubbleState(false);
          }, RESPONSE_DISPLAY_DURATION);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      };

      class Player {
        constructor() {
          this.pos = p.createVector(p.width / 2, p.height - 50);
          this.speed = 5;
          this.minY = p.height * 3 / 4;
          this.maxY = p.height - 25;
        }

        update() {
          let moveVector = p.createVector(0, 0);

          if (p.keyIsDown(87)) {
            moveVector.y -= this.speed;
          }
          if (p.keyIsDown(83)) {
            moveVector.y += this.speed;
          }
          if (p.keyIsDown(65)) {
            moveVector.x -= this.speed;
          }
          if (p.keyIsDown(68)) {
            moveVector.x += this.speed;
          }

          const mousePos = p.createVector(p.mouseX, p.mouseY);
          const direction = p5.Vector.sub(mousePos, this.pos);
          if (direction.mag() > this.speed) {
            direction.setMag(this.speed);
          }

          moveVector.add(direction);

          if (moveVector.mag() > 0) {
            moveVector.setMag(this.speed);
            const newPos = p5.Vector.add(this.pos, moveVector);
            if (newPos.y >= this.minY && newPos.y <= this.maxY) {
              this.pos = newPos;
            } else if (newPos.y < this.minY) {
              this.pos.y = this.minY;
            } else if (newPos.y > this.maxY) {
              this.pos.y = this.maxY;
            }
            if (newPos.x >= 0 && newPos.x <= p.width) {
              this.pos.x = newPos.x;
            }
          }
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          p.image(playerImg, 0, 0, 70, 70);
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
          p.fill(0, 255, 0);
          p.rectMode(p.CENTER);
          p.rect(0, 0, 5, 10);
          p.pop();
        }

        hits(enemy) {
          let d = p.dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
          return d < 20;
        }
      }

      class Enemy {
        constructor() {
          this.pos = p.createVector(p.random(p.width), p.random(-100, -40));
          this.speed = p.random(1, 3);
          this.img = enemyImgs[p.floor(p.random(enemyImgs.length))];
        }

        update() {
          this.pos.y += this.speed;
          if (this.pos.y > p.height) {
            this.pos.y = p.random(-100, -40);
            this.pos.x = p.random(p.width);
          }
        }

        show() {
          p.push();
          p.translate(this.pos.x, this.pos.y);
          p.imageMode(p.CENTER);
          p.image(this.img, 0, 0, 50, 50);
          p.pop();
        }

        hits(player) {
          let d = p.dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
          return d < 40;
        }
      }
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, []);

  return (
    <div style={{ position: 'relative', margin: 0, padding: 0 }}>
      <div ref={sketchRef} style={{ width: '100%', height: '100%' }} />
      {showSpeechBubbleState && (
        <div className="speech-bubble" style={{ top: '50%', left: '50%', opacity: 1 }}>
          {aiResponseState}
        </div>
      )}
    </div>
  );
};

export default P5Sketch;
