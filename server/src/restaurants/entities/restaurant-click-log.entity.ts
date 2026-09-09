import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_click_logs')
export class RestaurantClickLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: string) => value !== null ? parseFloat(value) : null
  }})
  temp: number;

  @Column({ nullable: true })
  sky: string;

  @Column({ nullable: true })
  pty: string;

  @Column({ name: 'time_of_day', nullable: true })
  timeOfDay: string;

  @CreateDateColumn({ name: 'clicked_at' })
  clickedAt: Date;
}
