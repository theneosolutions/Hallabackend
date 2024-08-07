import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { Notifications } from './entities/notifications.entity';
import { isInt } from 'class-validator';
import { NotificationDto } from './dtos/create-notification.dto';
import { PageDto } from './dtos/page.dto';
import { PageMetaDto } from './dtos/page-meta.dto';
import { PageOptionsDto } from './dtos/page-option.dto';
import { UsersService } from '../users/users.service';
import { CommonService } from '../common/common.service';
import { IResponseNotifications } from './interfaces/response-notifications.interface';
import { IMessage } from '../common/interfaces/message.interface';

const request = require('request');

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationsRepository: Repository<Notifications>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) {}

  public async create(
    origin: string | undefined,
    dto: NotificationDto,
  ): Promise<Notifications> {
    const {
      user: userId,
      content,
      resourceId,
      resourceType,
      parent,
      parentType,
      sendNotificationTo,
    } = dto;
    console.log(
      '🚀 ~ file: notifications.service.ts:48 ~ NotificationsService ~ create ~ dto:',
      dto,
    );

    if (
      isNaN(sendNotificationTo) ||
      isNull(sendNotificationTo) ||
      isUndefined(sendNotificationTo)
    ) {
      throw new BadRequestException(['User cannot be null']);
    }

    const userDetail = await this.usersService.findOneById(sendNotificationTo);
    console.log('🚀 ~ NotificationsService ~ create ~ userDetail:', userDetail);

    if (isNull(userDetail) || isUndefined(userDetail)) {
      throw new BadRequestException(['User not found with id: ' + userId]);
    }

    const notificationItem = this.notificationsRepository.create({
      user: sendNotificationTo,
      content: content.body,
      resourceId: resourceId,
      parent: parent,
      parentType: parentType,
      status: false,
      resourceType: resourceType,
    });
    console.log(
      '🚀 ~ NotificationsService ~ create ~ notificationItem:',
      notificationItem,
    );

    await this.notificationsRepository.insert(notificationItem);

    console.log(
      '🚀 ~ file: notifications.service.ts:67 ~ NotificationsService ~ create ~ liveStreamAlertMobile:',
      JSON.stringify({
        registration_ids: [userDetail.deviceToken],
        collapss_key: 'type_a',
        notification: content,
        data: {
          notification_id: notificationItem.id,
          resource_id: parent ? parent : resourceId,
          resource_type: parent ? parentType : resourceType,
        },
        android: {
          channelId: 'com.halla',
          smallIcon: 'ic_launcher',
          color: '#FEC903',
          pressAction: {
            id: 'default',
          },
        },
      }),
    );

    request(
      {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
          'Content-Type': ' application/json',
          Authorization: 'key=' + process.env.FIREBASE_SERVER_ID,
        },
        body: JSON.stringify({
          registration_ids: [userDetail.deviceToken],
          collapss_key: 'type_a',
          notification: content,
          data: {
            notification_id: notificationItem.id,
            resource_id: parent ? parent : resourceId,
            resource_type: parent ? parentType : resourceType,
          },
          android: {
            channelId: 'com.codefreaks.stargate.ventures',
            smallIcon: 'ic_launcher',
            color: '#FEC903',
            pressAction: {
              id: 'default',
            },
          },
        }),
      },
      function (error: any, response: any, body: any) {
        if (error) {
          console.error(error);
        } else if (response.statusCode >= 400) {
          console.error(
            'HTTP Error: ' +
              response.statusCode +
              ' - ' +
              JSON.stringify(response),
          );
        } else {
          console.log(body);
        }
      },
    );

    return notificationItem;
  }

  public async getNotifications(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Notifications>> {
    const queryBuilder =
      this.notificationsRepository.createQueryBuilder('notifications');

    queryBuilder
      .leftJoinAndSelect('notifications.user', 'user')
      .orderBy('notifications.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async findOneById(id: string): Promise<Notifications> {
    const parsedValue = parseInt(id, 10);

    if (isNaN(parsedValue) && !isInt(parsedValue)) {
      throw new BadRequestException('Invalid notification id: ' + parsedValue);
    }

    const commentInfo = await this.notificationsRepository.findOne({
      where: {
        id: parsedValue,
      },
      relations: ['user'],
    });
    return commentInfo;
  }

  public async getNotificationsByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Notifications>> {
    const queryBuilder =
      this.notificationsRepository.createQueryBuilder('notifications');

    queryBuilder
      .where('notifications.userId = :id', { id: id })
      .leftJoinAndSelect('notifications.user', 'user')
      .orderBy('notifications.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async unreadNotificationByUserId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Notifications>> {
    const queryBuilder =
      this.notificationsRepository.createQueryBuilder('notifications');

    queryBuilder
      .where('notifications.userId = :id', { id: id })
      .andWhere('notifications.status = :status', { status: false })
      .leftJoinAndSelect('notifications.user', 'user')
      .orderBy('notifications.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async updateStatus(id: number): Promise<IResponseNotifications> {
    const notificationInfo = await this.notificationsRepository.findOneBy({
      id: id,
    });
    if (!notificationInfo) {
      throw new BadRequestException(
        'notification with id ' + notificationInfo + ' does not exist',
      );
    }

    notificationInfo.status = true;
    await this.notificationsRepository.update(id, notificationInfo);
    return notificationInfo;
  }

  public async readAllNotificationByUserId(id: number): Promise<IMessage> {
    await this.notificationsRepository.update({ user: id }, { status: true });
    return this.commonService.generateMessage(
      'All notifications are marked as read!',
    );
  }

  public async getNotificationsByResourceId(
    id: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Notifications>> {
    const queryBuilder =
      this.notificationsRepository.createQueryBuilder('notifications');

    queryBuilder
      .where('notifications.resourceId = :id', { id: id })
      .leftJoinAndSelect('notifications.user', 'user')
      .orderBy('notifications.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async getNotificationsByResourceType(
    type: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Notifications>> {
    const queryBuilder =
      this.notificationsRepository.createQueryBuilder('notifications');

    queryBuilder
      .where('notifications.resourceType = :type', { type: type })
      .leftJoinAndSelect('notifications.user', 'user')
      .orderBy('notifications.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  public async deleteByNotificationId(
    id: number,
  ): Promise<IResponseNotifications> {
    const notificationInfo = await this.notificationsRepository.findOneBy({
      id: id,
    });
    if (!notificationInfo) {
      throw new BadRequestException(
        'notification with id ' + notificationInfo + ' does not exist',
      );
    }

    const deleteResponse = await this.notificationsRepository.delete(
      notificationInfo.id,
    );
    if (!deleteResponse.affected) {
      throw new BadRequestException(
        'Error while deleting user. Please try again',
      );
    }

    return notificationInfo;
  }
}
