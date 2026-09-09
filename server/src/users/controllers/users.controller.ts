import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    const dbUser = await this.usersService.findById(user.sub);
    if (!dbUser) {
      return null;
    }
    const { password, ...result } = dbUser;
    return result;
  }

  @Patch('nickname')
  async updateNickname(
    @CurrentUser() user: JwtPayload,
    @Body('nickname') nickname: string,
  ) {
    if (!nickname || nickname.trim() === '') {
      throw new BadRequestException('Nickname is required');
    }
    const updatedUser = await this.usersService.updateNickname(user.sub, nickname);
    const { password, ...result } = updatedUser;
    return result;
  }

  @Post('location')
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body('lat') lat: number,
    @Body('lon') lon: number,
  ) {
    if (lat === undefined || lon === undefined) {
      throw new BadRequestException('Latitude and longitude are required');
    }
    const updatedUser = await this.usersService.updateLocation(user.sub, Number(lat), Number(lon));
    const { password, ...result } = updatedUser;
    return result;
  }

  @Get('check-nickname')
  async checkNickname(
    @CurrentUser() user: JwtPayload,
    @Query('nickname') nickname: string,
  ) {
    if (!nickname || nickname.trim() === '') {
      throw new BadRequestException('Nickname parameter is required');
    }
    const isAvailable = await this.usersService.checkNickname(nickname, user.sub);
    return { available: isAvailable };
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: { nickname?: string; bio?: string; contact?: string; interests?: string },
  ) {
    try {
      const updatedUser = await this.usersService.updateProfile(user.sub, updateDto);
      const { password, ...result } = updatedUser;
      return result;
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPG, JPEG, PNG, and WEBP image files are allowed'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const relativePath = `/uploads/avatars/${file.filename}`;
    const updatedUser = await this.usersService.updateAvatar(user.sub, relativePath);
    const { password, ...result } = updatedUser;
    return result;
  }

  @Post('me/password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body('currentPassword') currentPass: string,
    @Body('newPassword') newPass: string,
  ) {
    if (!currentPass || !newPass) {
      throw new BadRequestException('currentPassword and newPassword are required');
    }
    try {
      await this.usersService.changePassword(user.sub, currentPass, newPass);
      return { success: true, message: 'Password changed successfully' };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete('me')
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    try {
      await this.usersService.deleteAccount(user.sub);
      return { success: true, message: 'Account deactivated successfully' };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}

