import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async updateNickname(id: number, nickname: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.nickname = nickname;
    return this.userRepository.save(user);
  }

  async updateLocation(id: number, lat: number, lon: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.lastLat = lat;
    user.lastLon = lon;
    return this.userRepository.save(user);
  }

  async checkNickname(nickname: string, excludeUserId?: number): Promise<boolean> {
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.nickname = :nickname', { nickname });
    
    if (excludeUserId !== undefined) {
      query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  async updateProfile(
    userId: number,
    updateDto: { nickname?: string; bio?: string; contact?: string; interests?: string },
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateDto.nickname && updateDto.nickname !== user.nickname) {
      const isAvailable = await this.checkNickname(updateDto.nickname, userId);
      if (!isAvailable) {
        throw new Error('Nickname is already taken');
      }
      user.nickname = updateDto.nickname;
    }

    if (updateDto.bio !== undefined) user.bio = updateDto.bio;
    if (updateDto.contact !== undefined) user.contact = updateDto.contact;
    if (updateDto.interests !== undefined) user.interests = updateDto.interests;

    return this.userRepository.save(user);
  }

  async updateAvatar(userId: number, relativeFilePath: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar file from disk if it exists
    if (user.profileImageUrl && user.profileImageUrl.startsWith('/uploads/avatars/')) {
      const oldFileName = user.profileImageUrl.replace('/uploads/avatars/', '');
      const oldFilePath = join(process.cwd(), 'uploads', 'avatars', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error('Failed to delete old avatar file:', err);
        }
      }
    }

    user.profileImageUrl = relativeFilePath;
    return this.userRepository.save(user);
  }

  async changePassword(userId: number, currentPass: string, newPass: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPassValid = await bcrypt.compare(currentPass, user.password);
    if (!isPassValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.softDelete(userId);
  }
}

