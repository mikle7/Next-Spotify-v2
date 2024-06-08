'use client';

import { useState } from 'react';
import LibraryItemCard from './LibraryItemCard';
import { AuthSession, Playlist } from '@/types/types';
import { getPlaylistById } from '@/lib/actions';

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
    const requests = checkedPlaylists.map(async (playlistId) => {
      const playlist = await getPlaylistById(session, playlistId);
      const tracks = playlist.tracks.items.map((item) => ({
        artist: item.track.artists[0].name,
        name: item.track.name,
      }));
      return {
        playlistName: playlist.name,
        tracks,
      };
    });

    const playlistsToDownload = await Promise.all(requests);
    for (const { playlistName, tracks } of playlistsToDownload) {
      await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracks, playlistName }),
      });
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download</button>
      {playlists.map((playlist: Playlist) => (
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
