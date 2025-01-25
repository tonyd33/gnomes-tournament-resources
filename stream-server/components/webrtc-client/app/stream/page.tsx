import ClientOnly from "@/components/client-only";
import StreamClient from "./page.client";
import { DEBUG_WHIP, WHIP_URL } from "@/constants";

export default async function Home() {
  return (
    <ClientOnly>
      <StreamClient debugWhip={DEBUG_WHIP} whipUrl={WHIP_URL} />
    </ClientOnly>
  );
}

// This has to be dynamic, otherwise WHIP_URL just gets baked in during build
export const dynamic = 'force-dynamic';
