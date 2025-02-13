import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { decodeBase64Url } from 'src/lib/util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /** Accept a JWT token or basic auth */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const results = await Promise.allSettled([
        this.authorizeJWT(request),
        this.authorizeBasic(request),
      ]);
      const ok = results.some((result) => result.status === 'fulfilled');
      if (!ok) {
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private async authorizeJWT(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer') {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.verifyAsync(token);
    if (payload.sub !== this.configService.get('auth.adminUser')) {
      throw new UnauthorizedException();
    }
  }

  private async authorizeBasic(request: Request) {
    const [type, b64] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Basic') {
      throw new UnauthorizedException();
    }
    const [username, password] = decodeBase64Url(b64).split(':');
    if (
      this.configService.get('auth.adminUser') !== username ||
      this.configService.get('auth.adminPassword') !== password
    ) {
      throw new UnauthorizedException();
    }
  }
}
