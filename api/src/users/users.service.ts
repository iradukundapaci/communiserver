import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Profile } from "./entities/profile.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile"],
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ["profile"],
    });
  }

  async create(createUserDto: CreateUserDto.Input): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async createProfile(createProfileDto: CreateProfileDto.Input): Promise<Profile> {
    const profile = new Profile();
    Object.assign(profile, createProfileDto);
    return this.profileRepository.save(profile);
  }

  async update(id: string, updateUserDto: UpdateUserDto.Input): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.softDelete(user);
  }
}
