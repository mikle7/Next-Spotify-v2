'use client';

import { getPlaylistById } from '@/lib/actions';
import LibraryItemCard from './LibraryItemCard';
import { useState } from 'react';
import { Playlist, AuthSession } from '@/types/types';

export default function Playlists({
  playlists,
  session,
}: {
  playlists: Playlist[];
  session: AuthSession;
}) {
  const [checkedPlaylists, setCheckedPlaylists] = useState<string[]>(
    []
  );

  const handleChecked = (playlistId: string) => {
    setCheckedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId]
    );
  };

  const handleDownload = async () => {
    const requests = checkedPlaylists.map((playlistId) =>
      getPlaylistById(session, playlistId)
    );
    const responses = await Promise.all(requests);
    const tracks = responses.flatMap((playlist) =>
      playlist.tracks.items.map((item) => ({
        artist: item.track.artists[0].name,
        name: item.track.name,
      }))
    );

    console.log('TRACKS', tracks);
    await fetch('/api/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tracks }),
    });
  };

  return (
    <div>
      <button onClick={handleDownload}>Download</button>
      {playlists.map((playlist) => (
        <LibraryItemCard
          key={playlist.id}
          entity={playlist}
          type="playlists"
          subtitle={playlist.owner.display_name}
          onChecked={handleChecked}
        />
      ))}
    </div>
  );
}
