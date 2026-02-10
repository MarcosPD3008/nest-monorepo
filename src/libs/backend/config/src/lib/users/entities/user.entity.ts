import { Entity, Column, Index } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { BaseEntityWithTimestamps } from '../entities/base.entity';

@Entity('users')
export class User extends BaseEntityWithTimestamps {
  @Column({ length: 100 })
  @IsNotEmpty()
  @MinLength(2)
  firstName!: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @MinLength(2)
  lastName!: string;

  @Column({ length: 255 })
  @IsEmail()
  @Index({ unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ default: true })
  isActive!: boolean;

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

