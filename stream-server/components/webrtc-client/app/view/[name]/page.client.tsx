"use client";
import React from "react";
import ReactPlayer from "react-player/lazy";

export default function View({
  streamName,
  hlsUrl,
}: {
  streamName: string;
  hlsUrl: string;
}) {
  return (
    <div className="relative pt-[56.25%] min-h-40">
      <ReactPlayer
        url={`${hlsUrl}/${streamName}/index.m3u8`}
        playing
        controls
        muted
        volume={1}
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
      />
    </div>
  );
}
