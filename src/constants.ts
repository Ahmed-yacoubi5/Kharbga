export interface MusicTrack {
  id: string;
  name: string;
  path: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'traditional', name: 'مفتون بغزرة عينيها', path: '/music.mp3' },
  { id: 'ambient', name: ' إنت شمسي', path: '/inti_shamsi.mp3' }, 
  { id: 'desert', name: ' سيدي منصور', path: '/Sidi_Mansour.mp3' },
];
