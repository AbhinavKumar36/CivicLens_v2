import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function CityGlobe() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#c0c1ff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#ffb0cd" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group position={[0, -2, -5]}>
        {/* Core glowing sphere */}
        <Sphere ref={sphereRef} args={[3, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#0d0096"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
            emissive="#0d0096"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        {/* Outer tech ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.5, 0.05, 16, 100]} />
          <meshStandardMaterial color="#c0c1ff" emissive="#c0c1ff" emissiveIntensity={2} />
        </mesh>

        <mesh rotation={[Math.PI / 2.5, Math.PI / 4, 0]}>
          <torusGeometry args={[5, 0.02, 16, 100]} />
          <meshStandardMaterial color="#ffb0cd" emissive="#ffb0cd" emissiveIntensity={1.5} />
        </mesh>
      </group>
    </>
  );
}
