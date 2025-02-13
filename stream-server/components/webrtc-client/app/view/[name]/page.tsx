import ClientOnly from "@/components/client-only";
import ViewClient from "./page.client";
import { HLS_URL } from "@/constants";

export default async function View({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: streamName } = await params;

  return (
    <ClientOnly>
      <ViewClient streamName={streamName} hlsUrl={HLS_URL} />
    </ClientOnly>
  );
}
