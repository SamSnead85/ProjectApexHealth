import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';

@Entity({ schema: 'auth', name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'keycloak_id', nullable: true, unique: true })
  keycloakId?: string;

  @Column()
  email: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'organization_id' })
  @Index()
  organizationId: string;

  @Column()
  @Index()
  role: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
  passwordChangedAt?: Date;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }
}
