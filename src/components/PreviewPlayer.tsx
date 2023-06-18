"use client";

import { usePlayer } from "@/providers/TrackPlayerProvider";
import MainControllers from "./MainControllers";
import AdditionalControllers from "./AdditionalControllers";
import PlayerTrackInfo from "./PlayerTrackInfo";

export default function PreviewPlayer() {
  const { currentTrack } = usePlayer();

  if (!currentTrack) {
    return null;
  }

  return (
    <footer
      className={`sticky bottom-0 grid grid-cols-12 gap-12 bg-background items-center justify-between px-3 py-3 ${
        currentTrack ? "py-3" : "py-0"
      }`}
    >
      <PlayerTrackInfo currentTrack={currentTrack} />
      <MainControllers />
      <AdditionalControllers />
    </footer>
  );
}
