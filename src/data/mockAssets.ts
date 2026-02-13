import type { Asset } from '../domain/assets'

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'A-001',
    name: 'interview-camera-a.mov',
    state: 'DECISION_PENDING',
    mediaType: 'VIDEO',
    proxyVideoUrl: '/mock-media/interview-camera-a.mp4',
    capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'A-002',
    name: 'ambiance-plateau.wav',
    state: 'DECIDED_KEEP',
    mediaType: 'AUDIO',
    proxyAudioUrl: '/mock-media/ambiance-plateau.mp3',
    capturedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'A-003',
    name: 'behind-the-scenes.jpg',
    state: 'DECIDED_REJECT',
    mediaType: 'IMAGE',
    proxyPhotoUrl: '/mock-media/behind-the-scenes.jpg',
    capturedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
