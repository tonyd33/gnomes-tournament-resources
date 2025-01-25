import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

@Exclude()
export class UserDto {
  @Expose()
  @IsInt()
  @ApiProperty()
  id: number;

  @Expose()
  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  passwordhash: string;

  @Expose()
  @IsString()
  @ApiProperty()
  token: string;
}
