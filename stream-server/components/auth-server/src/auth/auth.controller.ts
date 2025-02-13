import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MediaMTXCallbackDto } from './dto/mediamtx-callback.dto';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('callbacks/mediamtx')
  @ApiOkResponse()
  @ApiOperation({ operationId: 'authorizeMediaMTX' })
  @HttpCode(HttpStatus.OK)
  authorizeUser(@Body() mediaMTXCallbackDto: MediaMTXCallbackDto) {
    return this.authService.authorizeUserMediaMTX(mediaMTXCallbackDto);
  }

  @Post('login/password')
  @ApiOperation({ operationId: 'login' })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto.username, loginDto.password);
  }
}
