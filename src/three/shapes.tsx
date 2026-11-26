import type { Shape } from '../data/types'

// Formas 3D procedurais usadas até os modelos gerados (.glb) existirem.

const shell = { color: '#2a3438', metalness: 0.55, roughness: 0.35 }
const soft = { color: '#151a1c', metalness: 0.05, roughness: 0.9 }
const metal = { color: '#c9d2d4', metalness: 0.9, roughness: 0.25 }
const accent = { color: '#ff6a3d', metalness: 0.3, roughness: 0.4, emissive: '#401204' }
const glass = { color: '#0a2e33', metalness: 1, roughness: 0.05, emissive: '#06302c' }
const light = { color: '#d9e2e0', roughness: 0.6 }

function Headphones() {
  return (
    <group scale={1.05}>
      <mesh position={[0, 0.15, 0]}>
        <torusGeometry args={[1.15, 0.09, 20, 60, Math.PI]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI * 0.2]}>
        <torusGeometry args={[1.08, 0.07, 14, 40, Math.PI * 0.6]} />
        <meshStandardMaterial {...soft} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[1.15 * s, -0.05, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[1.12 * s, -0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.55, 0.55, 0.32, 40]} />
            <meshStandardMaterial {...shell} />
          </mesh>
          <mesh position={[0.93 * s, -0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.42, 0.13, 16, 40]} />
            <meshStandardMaterial {...soft} />
          </mesh>
          <mesh position={[1.29 * s, -0.55, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.5, 0.025, 10, 48]} />
            <meshStandardMaterial {...accent} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Camera() {
  return (
    <group scale={0.95}>
      <mesh>
        <boxGeometry args={[2.3, 1.4, 0.8]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh position={[-0.95, -0.02, 0.4]}>
        <boxGeometry args={[0.5, 1.35, 0.5]} />
        <meshStandardMaterial {...soft} />
      </mesh>
      <mesh position={[0.15, 0.85, -0.02]}>
        <boxGeometry args={[0.8, 0.4, 0.7]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh position={[0.2, -0.05, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.52, 0.56, 0.9, 48]} />
        <meshStandardMaterial {...soft} />
      </mesh>
      <mesh position={[0.2, -0.05, 0.75]}>
        <torusGeometry args={[0.54, 0.04, 12, 48]} />
        <meshStandardMaterial {...accent} />
      </mesh>
      <mesh position={[0.2, -0.05, 1.3]}>
        <torusGeometry args={[0.5, 0.03, 12, 48]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0.2, -0.05, 1.31]}>
        <circleGeometry args={[0.42, 48]} />
        <meshStandardMaterial {...glass} />
      </mesh>
      <mesh position={[0.8, 0.77, 0.05]}>
        <cylinderGeometry args={[0.17, 0.17, 0.14, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[-0.85, 0.75, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 20]} />
        <meshStandardMaterial {...accent} />
      </mesh>
    </group>
  )
}

const KEYS: [number, number, 'a' | 'l' | 's'][] = []
for (let r = 0; r < 5; r++)
  for (let c = 0; c < 14; c++) {
    if (r === 4 && c > 3 && c < 10) continue
    const kind = (r === 0 && c === 0) || (r === 3 && c === 12) ? 'a' : r === 0 ? 'l' : 's'
    KEYS.push([r, c, kind])
  }

function Keyboard() {
  return (
    <group rotation={[0.55, 0, 0]}>
      <mesh>
        <boxGeometry args={[3, 0.28, 1.25]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      {KEYS.map(([r, c, k]) => (
        <mesh key={`${r}-${c}`} position={[-1.36 + c * 0.21, 0.2, -0.46 + r * 0.23]}>
          <boxGeometry args={[0.17, 0.12, 0.17]} />
          <meshStandardMaterial {...(k === 'a' ? accent : k === 'l' ? light : soft)} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.2, -0.46 + 4 * 0.23]}>
        <boxGeometry args={[1.2, 0.12, 0.17]} />
        <meshStandardMaterial {...light} />
      </mesh>
      <mesh position={[1.36, 0.25, -0.46]}>
        <cylinderGeometry args={[0.11, 0.11, 0.2, 24]} />
        <meshStandardMaterial {...metal} />
      </mesh>
    </group>
  )
}

function Chair() {
  return (
    <group scale={0.85} position={[0, 0.1, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.22, 1.4]} />
        <meshStandardMaterial {...soft} />
      </mesh>
      <mesh position={[0, 1.15, -0.62]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.4, 2, 0.2]} />
        <meshStandardMaterial {...soft} />
      </mesh>
      <mesh position={[0, 0.55, -0.5]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.12]} />
        <meshStandardMaterial {...accent} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.8 * s, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.1, 1]} />
          <meshStandardMaterial {...shell} />
        </mesh>
      ))}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.45, -1.1, 0]}>
              <boxGeometry args={[0.9, 0.08, 0.12]} />
              <meshStandardMaterial {...shell} />
            </mesh>
            <mesh position={[0.88, -1.22, 0]}>
              <sphereGeometry args={[0.1, 16, 12]} />
              <meshStandardMaterial {...soft} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Generic() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial {...shell} />
      </mesh>
      <mesh>
        <boxGeometry args={[1.64, 1.64, 0.26]} />
        <meshStandardMaterial {...accent} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.26, 1.64, 1.64]} />
        <meshStandardMaterial {...accent} />
      </mesh>
    </group>
  )
}

export function ShapeMesh({ shape }: { shape: Shape }) {
  switch (shape) {
    case 'headphones':
      return <Headphones />
    case 'camera':
      return <Camera />
    case 'keyboard':
      return <Keyboard />
    case 'chair':
      return <Chair />
    default:
      return <Generic />
  }
}
