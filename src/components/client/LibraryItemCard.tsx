'use client';

import { Playlist } from '@/types/types';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  type: 'artists' | 'playlists' | 'albums';
  entity: Playlist;
  subtitle?: string;
  onChecked?: (playlistId: string) => void;
}

export default function LibraryItemCard({
  type,
  entity,
  subtitle,
  onChecked,
}: Props) {
  const pathname = usePathname();
  const href = `/${type}/${entity.id}`;

  if (!entity) return null;

  return (
    <div className="flex justify-between">
      <Link
        href={href}
        className={`${
          pathname === href ? 'bg-paper-400' : ''
        } flex items-center p-2 gap-3 rounded-md text-white cursor-pointer  hover:bg-paper-600`}
      >
        {entity.images?.[0] && (
          <Image
            src={entity.images[0]?.url}
            alt={entity.name}
            height={50}
            width={50}
            className={`${
              type === 'artists' ? 'rounded-full' : 'rounded-md'
            } aspect-square object-cover`}
          />
        )}

        <div className="truncate">
          <h6 className="w-full text-sm font-semibold truncate hover:text-white">
            {entity.name}
          </h6>
          {type !== 'artists' && (
            <span className="mt-1 text-xs font-medium text-gray">
              {subtitle}
            </span>
          )}
        </div>
      </Link>
      <Checkbox.Root
        onCheckedChange={() => onChecked?.(entity.id)}
        className="shadow-blackA4 hover:bg-violet3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] bg-slate-700  outline-none focus:shadow-[0_0_0_2px_black] "
        id="c1"
      >
        <Checkbox.Indicator className="text-white ">
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </div>
  );
}
