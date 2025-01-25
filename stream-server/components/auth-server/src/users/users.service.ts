import * as bcrypt from 'bcryptjs';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';
import { asyncTap, guardNotNullish, randomBase64String } from 'src/lib/util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async #createFromDto(createUserDto: CreateUserDto): Promise<User> {
    const passwordhash = await bcrypt.hash(createUserDto.password, 10);
    const token = createUserDto.token ?? randomBase64String(32);

    return this.userRepository.create({
      username: createUserDto.username,
      passwordhash,
      token,
    });
  }

  async #validateUniqueNewUsers(users: User[]) {
    const usernames = users.map(({ username }) => username);
    if (usernames.length < new Set(usernames).size) {
      throw new ConflictException('Usernames must be unique');
    }
    const existingUser = await this.userRepository.findOne({
      where: { username: In(usernames) },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with username ${existingUser.username} already exists`,
      );
    }
  }

  async bulkCreate(createUserDtos: CreateUserDto[]): Promise<UserDto[]> {
    return Promise.all(
      createUserDtos.map((createUserDto) => this.#createFromDto(createUserDto)),
    )
      .then(asyncTap((users) => this.#validateUniqueNewUsers(users)))
      .then((users) => this.userRepository.save(users))
      .then((users) => users.map((user) => plainToInstance(UserDto, user)));
  }

  async create(createUserDto: CreateUserDto) {
    return this.#createFromDto(createUserDto)
      .then(asyncTap((user) => this.#validateUniqueNewUsers([user])))
      .then((user) => this.userRepository.save(user))
      .then((user) => plainToInstance(UserDto, user));
  }

  async findAll() {
    return this.userRepository
      .find()
      .then((users) => users.map((user) => plainToInstance(UserDto, user)));
  }

  async findById(id: number) {
    return this.userRepository
      .findOne({ where: { id } })
      .then(guardNotNullish('User not found'))
      .then((user) => plainToInstance(UserDto, user));
  }

  async findByToken(token: string) {
    return this.userRepository
      .findOne({ where: { token } })
      .then(guardNotNullish('User not found'))
      .then((user) => plainToInstance(UserDto, user));
  }

  async findByUsername(username: string) {
    return this.userRepository
      .findOne({ where: { username } })
      .then(guardNotNullish('User not found'))
      .then((user) => plainToInstance(UserDto, user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository
      .findOne({ where: { id } })
      .then(guardNotNullish('User not found'));
    const passwordhash = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, 10)
      : userToUpdate.passwordhash;
    const updatedUser = await this.userRepository.save({
      ...userToUpdate,
      ...updateUserDto,
      passwordhash,
    });

    return plainToInstance(UserDto, updatedUser);
  }

  async remove(id: number) {
    const user = await this.userRepository
      .findOne({ where: { id } })
      .then(guardNotNullish('User not found'));
    await this.userRepository.remove([user]);
  }
}
