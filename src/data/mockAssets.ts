import type { Asset } from '../domain/assets'

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'A-001',
    name: 'interview-camera-a.mov',
    state: 'DECISION_PENDING',
    mediaType: 'VIDEO',
    capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'A-002',
    name: 'ambiance-plateau.wav',
    state: 'DECIDED_KEEP',
    mediaType: 'AUDIO',
    capturedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'A-003',
    name: 'behind-the-scenes.jpg',
    state: 'DECIDED_REJECT',
    mediaType: 'IMAGE',
    capturedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
