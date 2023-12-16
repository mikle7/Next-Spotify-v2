import AlbumCards from '@/components/AlbumCards';
import ArtistCards from '@/components/ArtistCards';
import PlayTrackButton from '@/components/PlayTrackButton';
import { Playlists } from '@/components/Playlists';
import TrackCards from '@/components/TrackCards';
import {
  getNewReleases,
  getRecentlyPlayedTracks,
  getTopItems,
  getUserLikedAlbums,
  getUserLikedArtists,
  getUserLikedPlaylists,
  getUserLikedSongs,
  readPlaylistData,
} from '@/lib/actions';
import { Artist, Track } from '@/types/types';
import { getGreeting } from '@/utils/clientUtils';
import { getAuthSession } from '@/utils/serverUtils';
import { Album } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// export const metadata = {
//   title: 'Welcome to Spotify',
// };

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  // const playlists = await getUserLikedPlaylists(session);

  // const downloadTracks = await readPlaylistData('Michael Bell');

  return (
    <section className="flex flex-col items-start">
      <h1 className="mt-8">Playlists</h1>
      <Playlists session={session} />

    </section>
  );
}
