import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CommonService } from '../common/common.service';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Card } from './entities/card.entity';
import { isInt } from 'class-validator';
import { CardDto } from './dtos/create-card.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { PageOptionsDto } from './dtos/page-option.dto';
import { UsersService } from '../users/users.service';

import { RatioEnum } from '../uploader/enums/ratio.enum';
import { UploaderService } from '../uploader/uploader.service';
import { IMessage } from 'src/common/interfaces/message.interface';
import { UpdateCardDto } from './dtos/update-card.dto';
import { Events } from 'src/events/entities/event.entity';
import { Users } from 'src/users/entities/user.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly commonService: CommonService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly uploaderService: UploaderService,
  ) {}

  public async create(origin: string | undefined, dto: CardDto): Promise<Card> {
    const { name, type, notes, file } = dto;
    console.log('🚀 ~ CardService ~ create ~ dto:', dto);
    if (isNull(file) || isUndefined(file)) {
      throw new BadRequestException(['file cannot be null']);
    }

    if (isNull(name) || isUndefined(name)) {
      throw new BadRequestException(['name cannot be null']);
    }
    const card = this.cardRepository.create({
      name: name,
      type: type || 'Invitation',
      notes: notes || null,
      status: 'active',
      file: file,
    });
    await this.cardRepository.insert(card);
    return card;
  }

  public async findOneById(id: number): Promise<Card> {
    console.log('🚀 ~ CardService ~ id:', { id });
    const cardItem = await this.cardRepository.findOneBy({ id });
    console.log('🚀 ~ CardService ~ cardItem:', cardItem);
    this.commonService.checkEntityExistence(cardItem, 'card');
    return cardItem;
  }

  public async getCards(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CardDto>> {
    const queryBuilder = this.cardRepository.createQueryBuilder('card');

    queryBuilder
      .select([
        'card.id',
        'card.name',
        // 'card.file',
        'card.status',
        'card.type',
        'card.image',
        'card.notes',
        'card.createdAt',
      ])
      .orderBy('card.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    if (pageOptionsDto.search !== '') {
      queryBuilder.andWhere(
        '(card.status like :search OR' +
          ' card.name like :search OR' +
          ' card.notes like :search OR' +
          ' card.type like :search)',
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    if (pageOptionsDto.status !== '') {
      queryBuilder.andWhere('card.status like :status', {
        status: `%${pageOptionsDto.status}%`,
      });
    }

    if (pageOptionsDto.createdAt !== '') {
      const createdAtDate = this.commonService.getDateInMySQLFormat(
        pageOptionsDto.createdAt,
      );
      queryBuilder.andWhere('card.createdAt like :createdAt', {
        createdAt: `%${createdAtDate}%`,
      });
    }

    const itemCount = await queryBuilder.getCount();
    let { entities }: any = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async findCardById(id: string): Promise<Card> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid card id: ' + parsedValue);
    }
    try {
      const cardItem = this.cardRepository
        .createQueryBuilder('card')
        .where('card.id = :id', { id: parsedValue })
        .select([
          'card.id',
          'card.name',
          // 'card.file',
          'card.status',
          'card.type',
          'card.image',
          'card.notes',
          'card.createdAt',
        ])
        .getOne();
      this.commonService.checkEntityExistence(cardItem, 'card');
      return cardItem;
    } catch (error) {
      throw new BadRequestException([error?.message]);
    }
  }
}
