import type { Asset } from '../domain/assets'

export const INITIAL_ASSETS: Asset[] = [
  { id: 'A-001', name: 'interview-camera-a.mov', state: 'DECISION_PENDING' },
  { id: 'A-002', name: 'ambiance-plateau.wav', state: 'DECIDED_KEEP' },
  { id: 'A-003', name: 'behind-the-scenes.jpg', state: 'DECIDED_REJECT' },
]
