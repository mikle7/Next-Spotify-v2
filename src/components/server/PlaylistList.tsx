import { getUserLikedPlaylists } from '@/lib/actions';
import Playlists from '@/components/client/Playlists';
import { AuthSession } from '@/types/types';

export default async function PlaylistList({
  session,
}: {
  session: AuthSession;
}) {
  const playlists = await getUserLikedPlaylists(session);
  return <Playlists playlists={playlists} session={session} />;
}
