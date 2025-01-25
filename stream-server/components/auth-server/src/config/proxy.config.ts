import { registerAs } from '@nestjs/config';

export default registerAs('proxy', () => ({
  mediaMTXIngestURL:
    process.env.PROXY_MEDIAMTX_INGEST_URL ?? 'http://localhost:9997',
}));
