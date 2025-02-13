import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { MediaMTXCallbackDto } from './dto/mediamtx-callback.dto';
import { decodeBase64Url, guardNotNullish } from 'src/lib/util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async authorizeByUserPass(
    username: string,
    password: string,
  ): Promise<string> {
    const user = await this.userRepository
      .findOne({ where: { username } })
      .then(guardNotNullish('User not found'));
    const ok = await bcrypt.compare(password, user.passwordhash);
    if (!ok) {
      throw new UnauthorizedException();
    } else {
      return username;
    }
  }

  /** Take a b64-encoded username:password, decode it, and verify. */
  async authorizeByUserPassB64(userpassb64: string) {
    const [username, password] = decodeBase64Url(userpassb64).split(':');
    return this.authorizeByUserPass(username, password);
  }

  async authorizeByToken(token: string) {
    return this.userRepository
      .findOne({ where: { token } })
      .then(guardNotNullish('User not found'))
      .then((user) => user.username);
  }

  async authorizeUserMediaMTX(mediaMTXCallbackDto: MediaMTXCallbackDto) {
    // Allow multiple authentication options.
    const results = await Promise.allSettled([
      this.authorizeByUserPass(
        mediaMTXCallbackDto.user,
        mediaMTXCallbackDto.password,
      ),
      this.authorizeByUserPassB64(mediaMTXCallbackDto.path),
      this.authorizeByToken(mediaMTXCallbackDto.path),
    ]);

    const username = results.find((result) => result.status === 'fulfilled');
    if (!username) {
      throw new UnauthorizedException();
    }
    return username.value;
  }

  async authorizeAdmin(username: string, password: string) {
    if (
      this.configService.get('auth.adminUser') !== username ||
      this.configService.get('auth.adminPassword') !== password
    ) {
      throw new UnauthorizedException();
    }
  }

  async loginAdmin(username: string, password: string) {
    await this.authorizeAdmin(username, password);
    const payload = { sub: username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
