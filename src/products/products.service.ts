import { PrismaClient } from '@prisma/client';
import {
  NotFoundException,
  OnModuleInit,
  Injectable,
  Logger,
} from '@nestjs/common';

import { PaginationDto } from '@common/dto';

import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Products service');

  onModuleInit() {
    this.$connect();
    this.logger.log('🚀 Database connected');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.product.findMany({
      where: { available: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const data = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });

    if (!data) throw new NotFoundException(`Not found product with id #${id}`);

    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { id: _, ...data } = updateProductDto;

    return await this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // return await this.product.delete({
    //   where: { id }
    // })

    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });

    return product;
  }
}
