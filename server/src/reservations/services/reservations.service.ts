import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { RestaurantsService } from '../../restaurants/services/restaurants.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(
    userId: number,
    restaurantId: number,
    reservationTime: Date,
    partySize: number,
  ): Promise<Reservation> {
    const restaurant = await this.restaurantsService.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const reservation = this.reservationRepository.create({
      userId,
      restaurantId,
      reservationTime: new Date(reservationTime),
      partySize,
      status: 'PENDING',
    });

    return this.reservationRepository.save(reservation);
  }

  async findMyReservations(userId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { userId },
      relations: { restaurant: true },
      order: { reservationTime: 'DESC' },
    });
  }
}
