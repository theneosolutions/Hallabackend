import { ApiProperty } from '@nestjs/swagger';
import { IEvent } from '../interfaces/event.interface';
import { IResponseEvent } from '../interfaces/response-event.interface';

export class ResponseEventsMapper implements IResponseEvent {
  @ApiProperty({
    description: 'User id',
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
    type: String,
    example: ['+923012345678', '+962245234234'],
  })
  public contacts?: String[];

  @ApiProperty({
    description: 'Event Name',
    example: 'Restaurant opening invitation',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Event Image',
    example:
      'https://hallabucket007.s3.amazonaws.com/events/ceb705e6-21a8-5f3d-bdc0-d67a6aa0e123/89e8a91c-74e3-4799-85da-d3bd2a8e1025.jpeg',
    type: String,
  })
  public image: string;

  @ApiProperty({
    description: 'Event date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public eventDate: string;

  @ApiProperty({
    description: 'Show QR code',
    example: true,
    type: Boolean,
  })
  public showQRCode: boolean;

  @ApiProperty({
    description: 'status',
    example: 'active',
    type: String,
  })
  public status: string;

  @ApiProperty({
    description: 'notes',
    example: 'just some random notes related to this event',
    type: String,
  })
  public notes: string;

  @ApiProperty({
    description: 'latitude',
    example: 10.287896,
    type: Number,
  })
  public latitude: number;

  @ApiProperty({
    description: 'latitude',
    example: 16.424534,
    type: Number,
  })
  public longitude: number;

  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public updatedAt: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Test event description',
    type: String,
  })
  public description: string;

  constructor(values: IResponseEvent) {
    Object.assign(this, values);
  }

  public static map(event: IEvent): ResponseEventsMapper {
    return new ResponseEventsMapper({
      id: event?.id,
      user: event?.user,
      contacts: event?.contacts,
      name: event?.name,
      image: event?.image,
      eventDate: event?.eventDate,
      status: event?.status,
      notes: event?.notes,
      showQRCode: event?.showQRCode,
      latitude: event?.latitude,
      longitude: event?.longitude,
      code: event?.code,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      description: event.description,
    });
  }
}
