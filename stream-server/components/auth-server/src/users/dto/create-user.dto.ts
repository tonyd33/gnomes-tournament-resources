import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty({
    description: 'Currently not used. Can be left blank',
  })
  password: string;

  @ApiProperty({
    required: false,
    description:
      'Set a token manually. If not provided, one will be randomly generated.',
  })
  token?: string;
}
