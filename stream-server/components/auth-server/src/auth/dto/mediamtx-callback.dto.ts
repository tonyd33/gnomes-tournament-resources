import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum MediaMTXAction {
  publish = 'publish',
  read = 'read',
  playback = 'playback',
  api = 'api',
  metrics = 'metrics',
  pprof = 'pprof',
}

export class MediaMTXCallbackDto {
  @IsString()
  @ApiProperty()
  user: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  ip: string;

  @IsEnum(MediaMTXAction)
  @ApiProperty({ enum: MediaMTXAction })
  action: MediaMTXAction;

  @IsString()
  @ApiProperty()
  path: string;

  @IsString()
  @ApiProperty()
  protocol: string;

  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  query: string;
}
