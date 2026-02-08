import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity({ schema: 'org', name: 'organizations' })
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'tax_id', type: 'varchar', length: 20, nullable: true })
  taxId?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  npi?: string;

  @Column({ name: 'cms_id', type: 'varchar', length: 20, nullable: true })
  cmsId?: string;

  @Column({ name: 'address_line1', type: 'varchar', length: 255, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', type: 'varchar', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state?: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ name: 'licensed_modules', type: 'text', array: true, default: '{}' })
  licensedModules: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
