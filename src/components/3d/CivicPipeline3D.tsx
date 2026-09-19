import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const STAGES = [
  { label: 'CITIZEN VOICES', color: '#c0c1ff', pos: [-6, 2, -2] },
  { label: 'DEMANDS', color: '#ddb7ff', pos: [-3, -1, 0] },
  { label: 'THEMES', color: '#ffb0cd', pos: [0, 1, 2] },
  { label: 'HOTSPOTS', color: '#f751a1', pos: [2, -2, 1] },
  { label: 'EVIDENCE', color: '#494bd6', pos: [4, 2, -1] },
  { label: 'PROPOSAL', color: '#10b981', pos: [7, 0, 0] },
];

export function CivicPipeline3D() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create connection lines
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < STAGES.length - 1; i++) {
      pts.push([
        new THREE.Vector3(...STAGES[i].pos),
        new THREE.Vector3(...STAGES[i+1].pos)
      ]);
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#c0c1ff" />
      
      <group ref={groupRef} position={[0, 0, -5]}>
        
        {/* City Grid Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
          <planeGeometry args={[40, 40, 40, 40]} />
          <meshBasicMaterial color="#c0c1ff" wireframe transparent opacity={0.05} />
        </mesh>

        {/* Nodes and Labels */}
        {STAGES.map((stage, i) => (
          <Float key={i} speed={2 + i * 0.5} rotationIntensity={0.5} floatIntensity={1}>
            <group position={new THREE.Vector3(...stage.pos)}>
              <Sphere args={[0.3, 16, 16]}>
                <meshStandardMaterial color={stage.color} emissive={stage.color} emissiveIntensity={2} />
              </Sphere>
              {/* Pulsing Outer Ring */}
              <Sphere args={[0.45, 16, 16]}>
                <meshBasicMaterial color={stage.color} transparent opacity={0.3} wireframe />
              </Sphere>
              <Text
                position={[0, -0.8, 0]}
                fontSize={0.3}
                color={stage.color}
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
              >
                {stage.label}
              </Text>
            </group>
          </Float>
        ))}

        {/* Connections */}
        {points.map((pair, i) => (
          <Line
            key={`line-${i}`}
            points={pair}
            color={STAGES[i].color}
            lineWidth={2}
            dashed
            dashScale={10}
            dashSize={2}
            dashOffset={0}
            transparent
            opacity={0.4}
          />
        ))}

        {/* Data particles moving along the lines */}
        <DataParticles points={points} colors={STAGES.map(s => s.color)} />
      </group>
    </>
  );
}

function DataParticles({ points, colors }: { points: THREE.Vector3[][], colors: string[] }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  const particleCount = points.length;
  
  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    const time = clock.getElapsedTime();
    
    for (let i = 0; i < particleCount; i++) {
      const start = points[i][0];
      const end = points[i][1];
      
      // Calculate position along the line (0 to 1), looping every 2 seconds
      const progress = (time * 0.5 + i * 0.2) % 1;
      
      const pos = new THREE.Vector3().lerpVectors(start, end, progress);
      
      const dummy = new THREE.Object3D();
      dummy.position.copy(pos);
      dummy.updateMatrix();
      
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}
