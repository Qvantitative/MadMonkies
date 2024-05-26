// components/P5Sketch.js
import React, { useEffect } from 'react';
import p5 from 'p5';

const P5Sketch = () => {
  useEffect(() => {
    let p5Instance;

    if (typeof window !== 'undefined') {
      const sketch = (p) => {
        p.setup = () => {
          p.createCanvas(400, 400).parent('p5-container');
          p.background(200);
        };

        p.draw = () => {
          p.ellipse(p.mouseX, p.mouseY, 50, 50);
        };
      };

      p5Instance = new p5(sketch);
    }

    return () => {
      if (p5Instance) {
        p5Instance.remove(); // Cleanup p5 instance
      }
    };
  }, []);

  return <div id="p5-container"></div>;
};

export default P5Sketch;
