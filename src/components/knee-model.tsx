'use client';

import { Html, Line } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { Quaternion, Vector3 } from 'three';
import { patellaPoint, tibialPoint, tibialOffset } from '@/lib/kinematics';
import { structures, type StructureId } from '@/lib/knee';
import { useKneeStore } from '@/store/use-knee-store';

type Point = [number, number, number];
const UP = new Vector3(0, 1, 0);
const BONE = '#e1d9c5';

function Segment({
  start,
  end,
  radius = 0.08,
  color,
  opacity = 1,
  active = false,
}: {
  start: Point;
  end: Point;
  radius?: number;
  color: string;
  opacity?: number;
  active?: boolean;
}) {
  const transform = useMemo(() => {
    const a = new Vector3(...start),
      b = new Vector3(...end);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize()),
      length: a.distanceTo(b),
    };
  }, [start, end]);
  return (
    <mesh
      position={transform.position}
      quaternion={transform.quaternion}
      scale={[radius, transform.length, radius]}
    >
      <cylinderGeometry args={[1, 1, 1, 12]} />
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={active ? color : '#000000'}
        emissiveIntensity={active ? 0.18 : 0}
      />
    </mesh>
  );
}

function Ellipsoid({
  position,
  scale,
  selected = false,
  color = BONE,
}: {
  position: Point;
  scale: Point;
  selected?: boolean;
  color?: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[1, 32, 20]} />
      <meshStandardMaterial
        color={selected ? '#d9eeea' : color}
        roughness={0.42}
        metalness={0.03}
        emissive={selected ? '#2b9e96' : '#000000'}
        emissiveIntensity={selected ? 0.2 : 0}
      />
    </mesh>
  );
}

function Selectable({ id, children }: { id: StructureId; children: React.ReactNode }) {
  const select = useKneeStore((s) => s.select);
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    select(id);
  };
  return (
    <group
      onClick={click}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      {children}
    </group>
  );
}

function Label({ id, position, side = 1 }: { id: StructureId; position: Point; side?: number }) {
  const locale = useKneeStore((s) => s.locale);
  const name = structures.find((s) => s.id === id)!.name[locale];
  return (
    <Html
      position={position}
      center
      distanceFactor={12}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[20, 0]}
    >
      <div className={`model-label ${side < 0 ? 'label-left' : ''}`}>
        <i />
        {name}
      </div>
    </Html>
  );
}

/** Original schematic geometry. Units are arbitrary, not anthropometric dimensions. */
export function KneeModel({
  angle,
  pathological = false,
}: {
  angle: number;
  pathological?: boolean;
}) {
  const layers = useKneeStore((s) => s.layers);
  const selected = useKneeStore((s) => s.selected);
  const playing = useKneeStore((s) => s.playing);
  const direction = useKneeStore((s) => s.direction);
  const patella = patellaPoint(angle);
  const lower = (p: Point) => tibialPoint(p, angle);
  const qActive = playing && direction === -1;
  const hActive = playing && direction === 1;
  const isSelected = (id: StructureId) => selected === id;
  const ligamentColor = (id: StructureId) => (isSelected(id) ? '#80ede0' : '#c0a46f');
  const muscleColor = (id: StructureId, active: boolean) =>
    isSelected(id) || active ? '#ea817b' : '#9d515b';

  return (
    <group>
      {layers.bones && (
        <>
          <Selectable id="femur">
            <mesh position={[0.04, 1.9, -0.05]} rotation={[0, 0, -0.04]} castShadow>
              <cylinderGeometry args={[0.24, 0.31, 3.1, 32]} />
              <meshStandardMaterial
                color={isSelected('femur') ? '#d9eeea' : BONE}
                roughness={0.45}
                emissive="#2b9e96"
                emissiveIntensity={isSelected('femur') ? 0.14 : 0}
              />
            </mesh>
            <Ellipsoid
              position={[0, 0.48, -0.08]}
              scale={[0.66, 0.65, 0.42]}
              selected={isSelected('femur')}
            />
            <Ellipsoid
              position={[-0.41, 0.12, -0.13]}
              scale={[0.37, 0.43, 0.55]}
              selected={isSelected('femur')}
            />
            <Ellipsoid
              position={[0.41, 0.12, -0.13]}
              scale={[0.37, 0.43, 0.55]}
              selected={isSelected('femur')}
            />
            <Ellipsoid
              position={[0, 0.34, 0.28]}
              scale={[0.42, 0.39, 0.22]}
              selected={isSelected('femur')}
            />
            <Ellipsoid
              position={[0.1, 3.45, -0.05]}
              scale={[0.245, 0.12, 0.245]}
              selected={isSelected('femur')}
            />
          </Selectable>
          <group rotation={[(angle * Math.PI) / 180, 0, 0]} position={tibialOffset(angle)}>
            <Selectable id="tibia">
              <Ellipsoid
                position={[0, -0.47, -0.06]}
                scale={[0.77, 0.23, 0.49]}
                selected={isSelected('tibia')}
              />
              <Ellipsoid
                position={[0, -0.79, -0.02]}
                scale={[0.5, 0.45, 0.36]}
                selected={isSelected('tibia')}
              />
              <mesh position={[-0.07, -2.02, 0]} rotation={[0, 0, 0.04]} castShadow>
                <cylinderGeometry args={[0.31, 0.19, 2.65, 32]} />
                <meshStandardMaterial
                  color={isSelected('tibia') ? '#d9eeea' : BONE}
                  roughness={0.48}
                  emissive="#2b9e96"
                  emissiveIntensity={isSelected('tibia') ? 0.14 : 0}
                />
              </mesh>
              <Ellipsoid
                position={[0, -0.95, 0.31]}
                scale={[0.18, 0.28, 0.13]}
                selected={isSelected('tibia')}
              />
              <Ellipsoid
                position={[-0.1, -3.35, 0]}
                scale={[0.2, 0.11, 0.2]}
                selected={isSelected('tibia')}
              />
            </Selectable>
            <Selectable id="fibula">
              <Ellipsoid
                position={[0.86, -0.7, -0.19]}
                scale={[0.19, 0.25, 0.2]}
                selected={isSelected('fibula')}
              />
              <mesh position={[0.8, -2.1, -0.15]} rotation={[0, 0, -0.04]} castShadow>
                <cylinderGeometry args={[0.09, 0.075, 2.65, 20]} />
                <meshStandardMaterial
                  color={isSelected('fibula') ? '#d9eeea' : BONE}
                  roughness={0.48}
                  emissive="#2b9e96"
                  emissiveIntensity={isSelected('fibula') ? 0.14 : 0}
                />
              </mesh>
            </Selectable>
          </group>
          <Selectable id="patella">
            <group position={patella} rotation={[((-angle * Math.PI) / 180) * 0.35, 0, 0]}>
              <Ellipsoid
                position={[0, 0.04, 0]}
                scale={[0.35, 0.4, 0.17]}
                selected={isSelected('patella')}
              />
              <Ellipsoid
                position={[0, -0.19, 0]}
                scale={[0.22, 0.24, 0.14]}
                selected={isSelected('patella')}
              />
            </group>
          </Selectable>
          {layers.labels && (
            <>
              <Label id="femur" position={[-0.5, 2.1, 0]} side={-1} />
              <Label id="tibia" position={lower([-0.4, -2.1, 0])} side={-1} />
              <Label id="fibula" position={lower([0.87, -2.7, -0.15])} />
              <Label id="patella" position={[patella[0] + 0.3, patella[1], patella[2]]} />
            </>
          )}
        </>
      )}
      {layers.ligaments && (
        <>
          <Selectable id="acl">
            <Segment
              start={[0.25, 0.2, -0.24]}
              end={lower([-0.08, -0.42, 0.16])}
              radius={0.07}
              color={ligamentColor('acl')}
            />
          </Selectable>
          <Selectable id="pcl">
            <Segment
              start={[-0.22, 0.22, 0.08]}
              end={lower([0.08, -0.42, -0.36])}
              radius={0.08}
              color={ligamentColor('pcl')}
            />
          </Selectable>
          <Selectable id="mcl">
            <Segment
              start={[-0.77, 0.21, -0.08]}
              end={lower([-0.58, -1.12, -0.05])}
              radius={0.075}
              color={ligamentColor('mcl')}
            />
          </Selectable>
          <Selectable id="lcl">
            <Segment
              start={[0.75, 0.24, -0.1]}
              end={lower([0.86, -0.67, -0.19])}
              radius={0.05}
              color={ligamentColor('lcl')}
            />
          </Selectable>
          <Segment
            start={[0, patella[1] - 0.26, patella[2]]}
            end={lower([0, -0.95, 0.43])}
            radius={0.09}
            color="#cdc0a4"
          />
          {layers.labels && <Label id="mcl" position={[-0.85, -0.45, 0]} side={-1} />}
        </>
      )}
      {layers.muscles && (
        <>
          <Selectable id="quadriceps">
            {[-0.44, 0, 0.44].map((x) => (
              <group key={x}>
                <Ellipsoid
                  position={[x, 2.18, 0.39]}
                  scale={[0.22, 1.1, 0.25]}
                  color={muscleColor('quadriceps', qActive)}
                  selected={false}
                />
                <Segment
                  start={[x, 1.2, 0.43]}
                  end={[0, patella[1] + 0.32, patella[2]]}
                  radius={0.055}
                  color="#dbb8ad"
                  active={qActive}
                />
              </group>
            ))}
            <Segment
              start={[0, 0.95, 0.54]}
              end={[0, patella[1] + 0.25, patella[2]]}
              radius={0.12}
              color="#d7bbae"
              active={qActive}
            />
          </Selectable>
          <Selectable id="hamstrings">
            {[-0.5, 0.5].map((x) => (
              <group key={x}>
                <Ellipsoid
                  position={[x, 2.1, -0.48]}
                  scale={[0.2, 1.2, 0.25]}
                  color={muscleColor('hamstrings', hActive)}
                />
                <Segment
                  start={[x, 1.05, -0.5]}
                  end={lower([x > 0 ? 0.86 : -0.48, x > 0 ? -0.7 : -0.85, -0.28])}
                  radius={0.065}
                  color="#dbb8ad"
                  active={hActive}
                />
              </group>
            ))}
          </Selectable>
          {layers.labels && (
            <>
              <Label id="quadriceps" position={[0.6, 2.75, 0.5]} />
              <Label id="hamstrings" position={[-0.6, 1.65, -0.6]} side={-1} />
            </>
          )}
        </>
      )}
      {layers.axis && (
        <>
          <Line
            points={[
              [-1.65, 0, 0],
              [1.65, 0, 0],
            ]}
            color={pathological ? '#eead77' : '#62dacf'}
            lineWidth={1.5}
            dashed
            dashSize={0.12}
            gapSize={0.09}
          />
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 3.3, 10]} />
            <meshBasicMaterial color="#63dccc" transparent opacity={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}
