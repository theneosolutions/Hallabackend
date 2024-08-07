import { ApiProperty } from '@nestjs/swagger';
import { IResponseNotifications } from '../interfaces/response-notifications.interface';
import { INotifications } from '../interfaces/notifications.interface';

export class ResponseNotificationMapper implements IResponseNotifications {
  @ApiProperty({
    description: 'Notification id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User id',
    example: 123,
    type: Number,
  })
  public user: number;

  @ApiProperty({
    description: 'resource id',
    example: 123,
    type: Number,
  })
  public resourceId: number;

  @ApiProperty({
    description: 'resource type',
    example: 'subscription',
    type: String,
  })
  public resourceType: string;

  @ApiProperty({
    description: 'notification content',
    example: 'You have a new meeting request with LINKEDIN',
    type: String,
  })
  public content: string;

  @ApiProperty({
    description: 'status',
    example: true,
    type: Boolean,
  })
  public status: boolean;

  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public updatedAt: Date;

  constructor(values: IResponseNotifications) {
    Object.assign(this, values);
  }

  public static map(notification: INotifications): ResponseNotificationMapper {
    return new ResponseNotificationMapper({
      id: notification.id,
      user: notification.user,
      content: notification.content,
      status: notification.status,
      resourceId: notification.resourceId,
      resourceType: notification.resourceType,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
  }
}
