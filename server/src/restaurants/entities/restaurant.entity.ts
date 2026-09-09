import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api_place_id', unique: true })
  apiPlaceId: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column('simple-array', { name: 'weather_tags', nullable: true })
  weatherTags: string[];

  @Column({ nullable: true })
  phone: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 7, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  lat: number;

  @Column('decimal', { precision: 10, scale: 7, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  lon: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'business_hours', type: 'text', nullable: true })
  businessHours: string;

  @Column({ type: 'json', nullable: true })
  menus: any;

  @Column('simple-array', { name: 'photo_urls', nullable: true })
  photoUrls: string[];

  @Column({ name: 'is_detail_cached', default: false })
  isDetailCached: boolean;
}
