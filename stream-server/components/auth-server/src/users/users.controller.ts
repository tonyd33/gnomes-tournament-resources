import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserDto })
  @ApiOperation({ operationId: 'createUser' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('bulk')
  @ApiCreatedResponse({ type: [UserDto] })
  @ApiOperation({ operationId: 'bulkCreateUsers' })
  @ApiBody({ type: [CreateUserDto] })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  bulkCreate(@Body() createUserDtos: CreateUserDto[]) {
    return this.usersService.bulkCreate(createUserDtos);
  }

  @Get()
  @ApiOkResponse({ type: [UserDto] })
  @ApiOperation({ operationId: 'listUsers' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/by-token/:token')
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ operationId: 'findUserByToken' })
  findByToken(@Param('token') token: string) {
    return this.usersService.findByToken(token);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ operationId: 'findUserById' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ operationId: 'updateUser' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  update(@Param('id') id: string, @Body() updateUsersDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUsersDto);
  }

  @Delete(':id')
  @ApiOkResponse()
  @ApiOperation({ operationId: 'removeUser' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
