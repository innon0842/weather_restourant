import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // ponytail: [hash passwords before saving using bcrypt or argon2]

  @Column()
  nickname: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'last_lat' })
  lastLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, name: 'last_lon' })
  lastLon: number;

  @Column({ nullable: true, name: 'profile_image_url' })
  profileImageUrl: string;

  @Column({ nullable: true, length: 100 })
  bio: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  interests: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
