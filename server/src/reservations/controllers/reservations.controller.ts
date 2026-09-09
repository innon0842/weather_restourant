import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/decorators/current-user.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body('restaurantId') restaurantId: number,
    @Body('reservationTime') reservationTime: string,
    @Body('partySize') partySize: number,
  ) {
    if (!restaurantId || !reservationTime || !partySize) {
      throw new BadRequestException('restaurantId, reservationTime, and partySize are required');
    }

    const size = parseInt(partySize as any, 10);
    if (isNaN(size) || size <= 0) {
      throw new BadRequestException('partySize must be a positive number');
    }

    return this.reservationsService.create(
      user.sub,
      Number(restaurantId),
      new Date(reservationTime),
      size,
    );
  }

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.reservationsService.findMyReservations(user.sub);
  }
}
