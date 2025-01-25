import { All, Controller, Next, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('proxy')
@ApiTags('proxy')
export class ProxyController {
  private mediaMTXIngestionProxy: RequestHandler;

  constructor(private configService: ConfigService) {
    this.configService = configService;

    // This is kind of stupid, we shouldn't be proxying this because there are
    // potentially multiple ingestion servers lol. We might want to have this
    // for singleton servers, or maybe implement service discovery so we can
    // selectively proxy for servers
    this.mediaMTXIngestionProxy = createProxyMiddleware({
      target: this.configService.get('proxy.mediaMTXIngestURL'),
      pathRewrite: { '^.*/proxy/mediamtx-ingest/': '/' },
      changeOrigin: true,
      // logger: console,
    });
  }

  @All('mediamtx-ingest/*path')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  proxyMediaMTXIngestion(@Req() req, @Res() res, @Next() next) {
    this.mediaMTXIngestionProxy(req, res, next);
  }
}
