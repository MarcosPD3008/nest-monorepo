import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions, DeepPartial, FindOptionsWhere } from 'typeorm';
import { BaseEntityWithTimestamps } from '../entities/base.entity';
import { PaginatedResponse } from '@libs/shared';

@Injectable()
export abstract class BaseService<T extends BaseEntityWithTimestamps> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  /**
   * Find all with pagination support
   * @param page Page number (1-indexed)
   * @param pageSize Number of items per page
   * @param where Optional where conditions
   * @param relations Optional relations to load
   * @returns Paginated response with items and total count
   */
  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10,
    where?: FindOptionsWhere<T>,
    relations?: string[]
  ): Promise<PaginatedResponse<T>> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await this.repository.findAndCount({
      where,
      relations,
      skip,
      take,
    });

    return {
      items,
      total,
    };
  }

  /**
   * Find all with pagination and custom options
   * @param options Find options including where, relations, order, etc.
   * @param page Page number (1-indexed)
   * @param pageSize Number of items per page
   * @returns Paginated response with items and total count
   */
  async findAllPaginatedWithOptions(
    options: FindManyOptions<T>,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<T>> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take,
    });

    return {
      items,
      total,
    };
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async findById(id: string, relations?: string[]): Promise<T> {
    return await this.findOne({
      where: { id } as any,
      relations,
    });
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repository.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id as any, { isActive: false } as any);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return await this.repository.count(options);
  }

  async exists(options: FindOneOptions<T>): Promise<boolean> {
    const count = await this.repository.count(options as FindManyOptions<T>);
    return count > 0;
  }
}
