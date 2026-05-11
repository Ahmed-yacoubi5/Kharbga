
export interface MusicTrack {
  id: string;
  name: string;
  path: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'traditional', name: 'مفتون بغزرة عينيها', path: '/music.mp3' },
  { id: 'ambient', name: ' إنت شمسي', path: 'public/لطفي بوشناق - إنت شمسي.mp3' }, // Example external link
  { id: 'desert', name: 'Desert Winds', path: 'https://assets.mixkit.co/music/preview/mixkit-mystical-look-914.mp3' },
];
