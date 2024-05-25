import PlaylistList from '@/components/server/PlaylistList';
import { getAuthSession } from '@/utils/serverUtils';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <section className="flex flex-col items-start">
      <h1 className="mt-8">Playlists</h1>
      <PlaylistList session={session} />
    </section>
  );
}
