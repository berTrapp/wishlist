import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import type { ModelStatus, Shape } from '../data/types'
import { prefersReducedMotion } from '../lib/hooks'
import { ShapeMesh } from './shapes'

interface Props {
  shape: Shape
  status: ModelStatus
  /** Gira sozinho; quando falso, gira só com hover */
  spin?: 'always' | 'hover'
  hovered?: boolean
  draggable?: boolean
  className?: string
  label?: string
}

function Spinner({ shape, spin, hovered, draggable }: Pick<Props, 'shape' | 'spin' | 'hovered' | 'draggable'>) {
  const g = useRef<Group>(null)
  const pop = useRef(prefersReducedMotion() ? 1 : 0)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const rot = useRef({ x: 0.25, y: 0.6, v: 0 })
  const reduce = prefersReducedMotion()

  useFrame((state, dt) => {
    const r = rot.current
    const active = spin === 'always' || hovered
    if (!drag.current && !reduce) {
      r.y += (active ? 0.6 : 0.08) * dt + r.v
      r.v *= 0.94
    }
    if (pop.current < 1) pop.current = Math.min(1, pop.current + dt * 2.2)
    const e = 1 - Math.pow(1 - pop.current, 3)
    if (g.current) {
      g.current.rotation.set(r.x, r.y, 0)
      g.current.position.y = reduce ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.08
      g.current.scale.setScalar(0.55 + 0.45 * e)
    }
  })

  const handlers = draggable
    ? {
        onPointerDown: (e: { clientX: number; clientY: number; stopPropagation: () => void }) => {
          e.stopPropagation()
          drag.current = { x: e.clientX, y: e.clientY }
        },
        onPointerMove: (e: { clientX: number; clientY: number }) => {
          if (!drag.current) return
          const dx = e.clientX - drag.current.x
          const dy = e.clientY - drag.current.y
          rot.current.y += dx * 0.012
          rot.current.x = Math.max(-0.8, Math.min(0.9, rot.current.x + dy * 0.008))
          rot.current.v = dx * 0.002
          drag.current = { x: e.clientX, y: e.clientY }
        },
        onPointerUp: () => (drag.current = null),
        onPointerLeave: () => (drag.current = null),
      }
    : {}

  return (
    <group ref={g} {...handlers}>
      <ShapeMesh shape={shape} />
      {draggable && (
        <mesh visible={false}>
          <sphereGeometry args={[2.2, 8, 8]} />
        </mesh>
      )}
    </group>
  )
}

export function ProductModel({ shape, status, spin = 'always', hovered, draggable, className, label }: Props) {
  const [failed, setFailed] = useState(false)

  if (status !== 'ready' || failed) {
    const text = status === 'queued' ? 'Na fila do 3D' : status === 'generating' ? 'Gerando modelo 3D' : 'Modelo indisponível'
    return (
      <div className={`model-pending ${className ?? ''}`} role="img" aria-label={text}>
        <span className="model-pending__orb" aria-hidden="true" />
        <span className="model-pending__text">{text}</span>
      </div>
    )
  }

  return (
    <div className={`model ${className ?? ''}`} role="img" aria-label={label ?? 'Modelo 3D do produto'}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 6.2], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
        onError={() => setFailed(true)}
      >
        <hemisphereLight args={['#dff7f3', '#1a0e08', 0.9]} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, 1, -3]} intensity={2.2} color="#ff6a3d" />
        <directionalLight position={[4, -2, -2]} intensity={1} color="#4fd8c4" />
        <Spinner shape={shape} spin={spin} hovered={hovered} draggable={draggable} />
      </Canvas>
    </div>
  )
}
