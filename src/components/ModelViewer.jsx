import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

// 1. Componente que carrega um arquivo .glb ou .gltf real
function RealModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// 2. Componente de demonstração (caso não tenha arquivo 3D)
function PlaceholderShape() {
  return (
    <mesh>
      {/* Geometria de um nó complexo para ficar bonito */}
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      {/* Material com a cor azul do Tailwind */}
      <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

// 3. O Palco Principal
export default function ModelViewer({ modelUrl }) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      {/* Canvas é a janela para o mundo 3D */}
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        
        {/* Suspense impede o site de quebrar enquanto o modelo carrega */}
        <Suspense fallback={null}>
          
          {/* Stage cria luzes de estúdio realistas automaticamente */}
          <Stage environment="city" intensity={0.6}>
            {modelUrl ? <RealModel url={modelUrl} /> : <PlaceholderShape />}
          </Stage>
          
        </Suspense>

        {/* OrbitControls permite dar zoom e girar com o mouse/dedo */}
        <OrbitControls autoRotate autoRotateSpeed={2} makeDefault />
      </Canvas>
    </div>
  );
}