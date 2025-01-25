"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAsyncState } from "@/hooks/use-async-state";
import { useStableCallback } from "@/hooks/use-stable-callback";
import { toast } from "@/hooks/use-toast";
import { WHIPClient } from "@eyevinn/whip-web-client";
import { useLocalStorage, useToggle } from "@uidotdev/usehooks";
import { useCallback, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function useWHIPClient({ debugWhip }: { debugWhip: boolean }) {
  const clientRef = useRef<WHIPClient>(null);
  const { call: ingest, state: ingestState } = useAsyncState(
    async (mediaStream: MediaStream) => {
      await clientRef.current?.ingest(mediaStream);
    },
    []
  );
  const { call: destroy, state: destroyState } = useAsyncState(async () => {
    await clientRef.current?.destroy();
  }, []);
  // TODO: Try to use h264 video codec and a compatible audio codec here.
  // Otherwise transcoding on the CPU while preserving quality is going to
  // be way too intensive!
  const createClient = useStableCallback(
    async (endpoint: string) => {
      if (clientRef.current) {
        await clientRef.current.destroy();
      }
      clientRef.current = new WHIPClient({
        endpoint,
        opts: {
          debug: debugWhip,
          iceServers: [{ urls: "stun:stun.l.google.com:19320" }],
          // This WHIP client library will error if this is an empty string or
          // undefined, so give it anything to make it happy.
          authkey: "whatever",
        },
      });
      await clientRef.current.setIceServersFromEndpoint();
    },
    [debugWhip]
  );

  const { call: createClientCall, state: createClientState } = useAsyncState(
    createClient,
    [createClient]
  );

  const pending =
    ingestState.status === "loading" ||
    destroyState.status === "loading" ||
    createClientState.status === "loading";

  return { ingest, destroy, create: createClientCall, pending };
}

export default function StreamClient({
  debugWhip,
  whipUrl,
}: {
  debugWhip: boolean;
  whipUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [streamKey, setStreamKey] = useLocalStorage("streamKey", "");
  const [hideStreamKey, toggleHideStreamKey] = useToggle(true);

  const {
    ingest: clientIngest,
    destroy: clientDestroy,
    create: clientCreate,
    pending,
  } = useWHIPClient({ debugWhip });

  const whipEndpoint = `${whipUrl}/${streamKey}/whip`;

  const handleStartStreamingCamera = useCallback(async () => {
    const [mediaStream, createStatus] = await Promise.all([
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }),
      clientCreate(whipEndpoint),
    ]);
    if (createStatus.status === "err") {
      toast({
        title: "Error",
        description: "Failed to connect, check console for error.",
      });
      console.error(createStatus.err);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    clientIngest(mediaStream);
  }, [clientCreate, clientIngest, whipEndpoint]);

  const handleStartStreamingScreen = useCallback(async () => {
    const [desktopStream, micStream, createStatus] = await Promise.all([
      navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      }),
      navigator.mediaDevices.getUserMedia({ audio: true }),
      clientCreate(whipEndpoint),
    ]);
    if (createStatus.status === "err") {
      toast({
        title: "Error",
        description: "Failed to connect, check console for error.",
      });
      console.error(createStatus.err);
    }
    // Try to add the mic audio to the stream.
    // What if multiple mic tracks?? X_X
    // TODO: Create a way for users to select themselves.
    const micAudioTracks = micStream.getAudioTracks();
    if (micAudioTracks.length > 0) {
      desktopStream.addTrack(micAudioTracks[0]);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = desktopStream;
    }
    clientIngest(desktopStream);
  }, [clientCreate, clientIngest, whipEndpoint]);

  const handleStopStreaming = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    clientDestroy();
  }, [clientDestroy]);

  return (
    <div className="p-16">
      <Button onClick={handleStartStreamingCamera} disabled={pending}>
        Start streaming camera
      </Button>
      <Button onClick={handleStartStreamingScreen} disabled={pending}>
        Start streaming screen
      </Button>
      <Button onClick={handleStopStreaming} disabled={pending}>
        Stop streaming
      </Button>
      <div className="flex flex-row items-center">
        <label className="contents">
          <span>Stream key</span>
          <Input
            value={streamKey}
            onChange={(e) => setStreamKey(e.currentTarget.value)}
            type={hideStreamKey ? "password" : "text"}
          />
        </label>
        <Button size="icon" onClick={() => toggleHideStreamKey()}>
          {!hideStreamKey ? <FaEye /> : <FaEyeSlash />}
        </Button>
      </div>
      <video ref={videoRef} autoPlay muted />
    </div>
  );
}
