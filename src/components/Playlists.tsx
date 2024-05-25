'use client';

import {
  getPlaylistById,
  getUserLikedPlaylists,
} from '@/lib/actions';
import { AuthSession, Playlist } from '@/types/types';
import LibraryItemCard from './LibraryItemCard';
import { useState } from 'react';
import axios from 'axios';
import { finished } from 'stream/promises';

export const Playlists = async ({
  playlists,
  session,
}: {
  playlists: Playlist[];
  session: AuthSession;
}) => {
  // const playlists = await getUserLikedPlaylists(session);
  // const [checkedPlaylists, setCheckedPlaylists] = useState<string[]>(
  //   []
  // );

  const checkedPlaylists: string[] = [];

  const handleChecked = (playlistId: string) => {
    if (checkedPlaylists.includes(playlistId)) {
      const index = checkedPlaylists.indexOf(playlistId);
      checkedPlaylists.splice(index, 1);
    } else {
      checkedPlaylists.push(playlistId);
    }

    console.log(checkedPlaylists);
  };

  const handleDownload = async () => {
    // map through each of the checked playlists and get the playlist information
    // get the tracks for each playlist
    // save them to JSON

    const requests = checkedPlaylists.map((playlistId) =>
      getPlaylistById(session, playlistId)
    );
    // const responses = await Promise.all(requests);

    // For each response (playlist), we access tracks and then map over each item.
    // Within the item we want to access track, and within that we will get the first artis and the name of the track

    // const tracks = responses.map((playlist) =>
    //   playlist.tracks.items.map((item) => ({
    //     artist: item.track.artists[0].name,
    //     name: item.track.name,
    //   }))
    // );

    // fetchmp3(tracks.flat());
    // await axios.post('/api/tracks', { tracks });
    // console.log(tracks);
  };

  console.log(playlists.length);
  return (
    <div>
      {/* <button onClick={handleDownload}>Download</button> */}
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
};
