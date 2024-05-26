import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import('./P5Sketch'), {
  ssr: false,
});

export default function Game() {
  return <P5Wrapper />;
}
