import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PageOptionsDto } from './dtos/page-option.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dtos/create-page';
import { UpdatePageDto } from './dtos/update-page.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async create(dto: CreatePageDto): Promise<Page> {
    const { type, title, content } = dto;

    const page = this.pageRepository.create({
      type,
      title,
      content,
    });

    await this.pageRepository.save(page);

    return page;
  }

  async update(id: number, dto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found.`);
    }

    const { type, title, content } = dto;

    if (type !== undefined) {
      page.type = type;
    }
    if (title !== undefined) {
      page.title = title;
    }
    if (content !== undefined) {
      page.content = content;
    }

    await this.pageRepository.save(page);

    return page;
  }

  async findById(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found.`);
    }

    return page;
  }

  async delete(id: number): Promise<void> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found.`);
    }

    await this.pageRepository.delete(id);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Page>> {
    const queryBuilder = this.pageRepository.createQueryBuilder('page');

    queryBuilder
      .orderBy('page.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }
}
