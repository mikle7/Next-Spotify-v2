// 'use client';

import { Playlists } from '@/components/Playlists';
import { getUserLikedPlaylists } from '@/lib/actions';

import { getAuthSession } from '@/utils/serverUtils';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  const playlists = await getUserLikedPlaylists(session);
  // Get users "Liked" songs
  // getUserLikedSongs;

  // const downloadTracks = await readPlaylistData('Michael Bell');

  // Pseudo For architecture with fetching on click.
  // For interactivity, we need to use a client component. So for fetching on a button press
  // it must use client.

  return (
    <section className="flex flex-col items-start">
      <h1 className="mt-8">Playlists</h1>
      <Playlists playlists={playlists} session={session} />
    </section>
  );
}
