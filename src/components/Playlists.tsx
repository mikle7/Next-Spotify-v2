'use client';

import { getUserLikedPlaylists } from '@/lib/actions';
import { AuthSession } from '@/types/types';

export const Playlists = ({ session }: { session: AuthSession }) => {
  return (
    <div>
      <h1>Playlists</h1>
      <button onClick={() => getUserLikedPlaylists(session)}>
        Get Playlists
      </button>
    </div>
  );
};
