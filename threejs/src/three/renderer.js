import * as THREE from 'three';

export const createRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
};
