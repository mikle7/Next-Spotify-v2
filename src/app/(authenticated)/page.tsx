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
  sendRequestToMp3,
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

  // const downloadTracks = await sendRequestToMp3();

  return (
    <section className="flex flex-col items-start">
      <h1 className="mt-8">Playlists</h1>
      {/* <Playlists session={session} /> */}

      {/* <button onClick={() => getUserLikedPlaylists(session)}>
        Get Playlists
      </button> */}
      {/* <div className="grid w-full grid-cols-12 gap-4">
        {topTracks.map((track) => (
          <Link
            href={`/tracks/${track.id}`}
            key={track.id}
            className="flex items-center justify-between col-span-4 pr-4 truncate rounded-md group/item bg-paper-600 hover:bg-paper-400"
          >
            <div className="flex items-center gap-4">
              {track.album.images.length > 0 ? (
                <Image
                  src={track.album.images[0].url}
                  alt={track.name}
                  width={72}
                  height={72}
                  className="object-cover h-full rounded-tl-md rounded-bl-md aspect-square"
                />
              ) : (
                <Album size={20} />
              )}
              <h3 className="font-semibold truncate">{track.name}</h3>
            </div>

            <PlayTrackButton
              track={track}
              variant="filled"
              className="invisible w-12 h-12 text-3xl group/btn group-hover/item:visible"
            />
          </Link>
        ))}
      </div> */}
      {/*
      <h1 className="mt-16">Recently played</h1>
      <TrackCards tracks={recentlyPlayed} />

      <h1 className="mt-16">Time Capsule</h1>
      <TrackCards tracks={allTimeTopTracks} />

      <h1 className="mt-16">Top Artists</h1>
      <ArtistCards artists={topArtists} />

      <h1 className="mt-16">New releases</h1>
      <AlbumCards albums={newReleases} /> */}
    </section>
  );
}
