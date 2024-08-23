import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDProductPage = () => {
  const modelContainerRef = useRef(null);
  const chessContainerRef = useRef(null);

  // Separate states for models
  const [currentModel, setCurrentModel] = useState('/models/mm.obj');
  const [currentChessModel, setCurrentChessModel] = useState('/models/king.obj');

  // Separate state for the 3D model section
  const [modelScene, setModelScene] = useState(null);
  const [modelRenderer, setModelRenderer] = useState(null);
  const [modelCamera, setModelCamera] = useState(null);
  const [modelControls, setModelControls] = useState(null);
  const [modelObject, setModelObject] = useState(null);

  // Separate state for the chess section
  const [chessScene, setChessScene] = useState(null);
  const [chessRenderer, setChessRenderer] = useState(null);
  const [chessCamera, setChessCamera] = useState(null);
  const [chessControls, setChessControls] = useState(null);
  const [chessObject, setChessObject] = useState(null);

  const initializeScene = (containerRef, cameraZPosition, setSceneState, setCameraState, setRendererState, setControlsState) => {
    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(newRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    newScene.add(directionalLight);

    // Set separate camera positions
    newCamera.position.z = cameraZPosition;

    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.05;

    setSceneState(newScene);
    setCameraState(newCamera);
    setRendererState(newRenderer);
    setControlsState(newControls);

    const handleResize = () => {
      newCamera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current.removeChild(newRenderer.domElement);
      newControls.dispose();
    };
  };

  useEffect(() => {
    // Initialize both scenes with different camera positions
    initializeScene(modelContainerRef, 2, setModelScene, setModelCamera, setModelRenderer, setModelControls);
    initializeScene(chessContainerRef, 200, setChessScene, setChessCamera, setChessRenderer, setChessControls); // Chess pieces closer
  }, []);

  const loadModel = (path, scene, setModelState, renderer, camera, controls) => {
    if (scene && renderer && camera && controls) {
      const loader = new OBJLoader();

      // Clear previous model from scene
      while (scene.children.length > 2) {
        scene.remove(scene.children[2]);
      }

      loader.load(path, (obj) => {
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

        obj.traverse((child) => {
          if (child.isMesh) {
            const texture = child.material.map;
            child.material = material;
            if (texture) {
              child.material.map = texture;
            }
          }
        });

        setModelState(obj);
        scene.add(obj);
      });

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    }
  };

  useEffect(() => {
    // Load model for the 3D product
    loadModel(currentModel, modelScene, setModelObject, modelRenderer, modelCamera, modelControls);
  }, [currentModel, modelScene, modelRenderer, modelCamera, modelControls]);

  useEffect(() => {
    // Load model for the chess piece
    loadModel(currentChessModel, chessScene, setChessObject, chessRenderer, chessCamera, chessControls);
  }, [currentChessModel, chessScene, chessRenderer, chessCamera, chessControls]);

  const changeModelColor = (color) => {
    if (modelObject) {
      modelObject.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(color);
        }
      });
    }
  };

  const changeChessColor = (color) => {
    if (chessObject) {
      chessObject.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(color);
        }
      });
    }
  };

  const handleChessModelChange = (modelPath) => {
    setCurrentChessModel(modelPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="py-4 px-8 bg-white shadow-md">
        <h1 className="text-xl font-bold text-gray-600">Interactive 3D Portfolio</h1>
      </header>

      {/* Interactive 3D Models Section */}
      <div className="flex flex-col md:flex-row w-full px-8 py-16">
        <div
          ref={modelContainerRef}
          className="w-full md:w-1/2 h-96 bg-black mx-auto mb-8 md:mb-0"
        ></div>

        <div className="w-full md:w-1/2 px-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">Interactive 3D Monkeys</h2>
          <p className="text-lg text-gray-500 mb-4">Select a Monkey to see in 3D</p>

          <div className="mb-6">
            <h3 className="font-semibold text-lg text-gray-600 mb-2">Gallery</h3>
            <div className="flex space-x-2">
              <img
                src="/models/imgMM.png"
                alt="Model 1"
                className="w-16 h-16 object-cover cursor-pointer"
                onClick={() => setCurrentModel('/models/mm.obj')}
              />
              <img
                src="/models/imgMM2.png"
                alt="Model 2"
                className="w-16 h-16 object-cover cursor-pointer"
                onClick={() => setCurrentModel('/models/mm2.obj')}
              />
              <img
                src="/models/imgMM3.png"
                alt="Model 3"
                className="w-16 h-16 object-cover cursor-pointer"
                onClick={() => setCurrentModel('/models/mm3.obj')}
              />
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={() => changeModelColor('red')}
            >
              Red
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              onClick={() => changeModelColor('green')}
            >
              Green
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => changeModelColor('blue')}
            >
              Blue
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chess Pieces Section */}
       <div className="flex flex-col md:flex-row w-full px-8 py-16">
         <div
           ref={chessContainerRef}
           className="w-full md:w-1/2 h-96 bg-black mx-auto mb-8 md:mb-0 flex justify-center items-center"
         ></div>

         <div className="w-full md:w-1/2 px-8">
           <h2 className="text-2xl font-bold mb-4 text-gray-600">Interactive Chess Pieces</h2>
           <p className="text-lg text-gray-500 mb-4">Select a chess piece to view in 3D.</p>

           <div className="mb-6">
             <h3 className="font-semibold text-lg text-gray-600 mb-2">Chess Gallery</h3>
             <div className="flex space-x-2">
                <img
                  src="/models/king.png"
                  alt="King"
                  className="w-16 h-16 object-cover cursor-pointer"
                  onClick={() => handleChessModelChange('/models/king.obj')}
                />
                <img
                  src="/models/rook.png"
                  alt="Rook"
                  className="w-16 h-16 object-cover cursor-pointer"
                  onClick={() => handleChessModelChange('/models/rook.obj')}
                />
                <img
                  src="/models/queen.png"
                  alt="Queen"
                  className="w-16 h-16 object-cover cursor-pointer"
                  onClick={() => handleChessModelChange('/models/queen.obj')}
                />
             </div>
           </div>

           <div className="flex space-x-4 mb-4">
             <button
               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
               onClick={() => changeChessColor('Gray')}
             >
               Gray
             </button>
             <button
               className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
               onClick={() => changeChessColor('gold')}
             >
               Gold
             </button>
             <button
               className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
               onClick={() => changeChessColor('purple')}
             >
               Purple
             </button>
           </div>
         </div>
       </div>
    </div>
  );
};

export default ThreeDProductPage;
