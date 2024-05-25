import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('./P5Sketch'), {
  ssr: false,
});

export default P5Wrapper;
