'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Component, Suspense, useEffect, useRef, useState } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Box3, Vector3 } from 'three';
import { dictionary } from '@/lib/i18n';
import { actualAngle, movementLimits } from '@/lib/kinematics';
import { useKneeStore, DEFAULT_CAMERA } from '@/store/use-knee-store';
import { KneeModel } from './knee-model';

class RenderBoundary extends Component<
  { children: React.ReactNode; message: string; retry: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="render-error" role="alert">
        <p>{this.props.message}</p>
        <button className="secondary-button" onClick={() => this.setState({ failed: false })}>
          {this.props.retry}
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

function CameraSync({ id }: { id: string }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const dragging = useRef(false);
  const pose = useKneeStore((s) => s.camera);
  const setCamera = useKneeStore((s) => s.setCamera);
  const { camera } = useThree();
  useEffect(() => {
    if (pose.owner === id) return;
    camera.position.set(...pose.position);
    controls.current?.target.set(...pose.target);
    controls.current?.update();
  }, [pose, camera, id]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping={false}
      minDistance={5.5}
      maxDistance={19}
      onStart={() => {
        dragging.current = true;
      }}
      onEnd={() => {
        dragging.current = false;
      }}
      onChange={() => {
        if (!dragging.current || !controls.current) return;
        setCamera({
          position: camera.position.toArray() as [number, number, number],
          target: controls.current.target.toArray() as [number, number, number],
          owner: id,
        });
      }}
    />
  );
}

function ImportedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const size = new Box3().setFromObject(scene).getSize(new Vector3());
    setScale(6.3 / Math.max(size.x, size.y, size.z, 0.001));
  }, [scene]);
  return (
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  );
}

function Scene({ comparison, id }: { comparison: boolean; id: string }) {
  const angle = useKneeStore((s) => s.angle);
  const pathology = useKneeStore((s) => s.pathology);
  const restriction = useKneeStore((s) => s.restriction);
  const contracture = useKneeStore((s) => s.contracture);
  const modelUrl = useKneeStore((s) => s.modelUrl);
  const displayed = comparison
    ? actualAngle(angle, movementLimits(pathology, restriction, contracture))
    : angle;
  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#d5e9f1', '#29353b', 1.6]} />
      <directionalLight position={[3, 6, 6]} intensity={3.2} color="#fff3dc" />
      <directionalLight position={[-4, 1, -3]} intensity={2.2} color="#74aaa9" />
      <pointLight position={[0, -4, 5]} intensity={16} color="#b0c3df" />
      <Suspense fallback={null}>
        {modelUrl && !comparison ? (
          <ImportedModel url={modelUrl} />
        ) : (
          <KneeModel angle={displayed} pathological={comparison} />
        )}
      </Suspense>
      <CameraSync id={id} />
      {!modelUrl && (
        <GizmoHelper alignment="top-right" margin={[39, 66]}>
          <GizmoViewport
            labels={['L', 'S', 'A']}
            axisColors={['#748e9c', '#83b5aa', '#759aa8']}
            axisHeadScale={0.75}
            labelColor="#13232b"
            hideNegativeAxes
            disabled
          />
        </GizmoHelper>
      )}
    </>
  );
}

export function KneeViewer({
  comparison = false,
  id = 'reference',
}: {
  comparison?: boolean;
  id?: string;
}) {
  const locale = useKneeStore((s) => s.locale);
  const angle = useKneeStore((s) => s.angle);
  const pathology = useKneeStore((s) => s.pathology);
  const restriction = useKneeStore((s) => s.restriction);
  const contracture = useKneeStore((s) => s.contracture);
  const mode = useKneeStore((s) => s.mode);
  const t = dictionary(locale);
  const shown = comparison
    ? actualAngle(angle, movementLimits(pathology, restriction, contracture))
    : angle;
  const atLimit = comparison && Math.abs(shown - angle) > 0.1;
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const test = document.createElement('canvas');
    const gl = test.getContext('webgl2') || test.getContext('webgl');
    setAvailable(Boolean(gl));
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);
  return (
    <div className={`scene ${comparison ? 'pathological-scene' : ''}`} data-testid={`viewer-${id}`}>
      {mode === 'compare' && (
        <div className={`scene-badge ${comparison ? 'amber' : ''}`}>
          <span className="status-dot" />
          {comparison ? t[pathology] : t.reference}
          <span className="scene-angle" data-testid={`angle-${id}`}>
            {shown.toFixed(1)}°
          </span>
        </div>
      )}
      {available === false ? (
        <div className="render-error" role="alert">
          {t.webglError}
        </div>
      ) : (
        available && (
          <RenderBoundary message={t.webglError} retry={t.retry}>
            <Canvas
              camera={{ position: DEFAULT_CAMERA.position, fov: 34, near: 0.1, far: 100 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.domElement.setAttribute('aria-label', comparison ? t[pathology] : t.reference);
                gl.domElement.setAttribute('role', 'img');
              }}
            >
              <Scene comparison={comparison} id={id} />
            </Canvas>
          </RenderBoundary>
        )
      )}
      {atLimit && (
        <div className="limit-badge" data-testid="limit-reached">
          {t.boundary}
        </div>
      )}
      <div className="scene-cross cross-one" />
      <div className="scene-cross cross-two" />
    </div>
  );
}
