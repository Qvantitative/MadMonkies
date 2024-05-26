import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

const P5Sketch = ({ aiResponse: initialAiResponse, showSpeechBubble: initialShowSpeechBubble }) => {
  const sketchRef = useRef();
  const [aiResponseState, setAiResponseState] = useState(initialAiResponse);
  const [showSpeechBubbleState, setShowSpeechBubbleState] = useState(initialShowSpeechBubble);

  useEffect(() => {
    const sketch = (p) => {
      // Your sketch code here
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, [aiResponseState, showSpeechBubbleState]);

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
