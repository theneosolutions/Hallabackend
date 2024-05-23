import { ApiProperty } from '@nestjs/swagger';
import { IResponseCard } from '../interfaces/response-card.interface';
import { ICard } from '../interfaces/card.interface';

export class ResponseCardMapper implements IResponseCard {
  @ApiProperty({
    description: 'Card id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'Card Name',
    example: 'Birthday Invitation',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Card Type',
    example: 'Birthday',
    type: String,
  })
  public type: string;

  @ApiProperty({
    description: 'status',
    example: 'active',
    type: String,
  })
  public status: string;

  @ApiProperty({
    description: 'notes',
    example: 'just some random notes related to this Card',
    type: String,
  })
  public notes: string;

  @ApiProperty({
    description: 'file',
    example: 'file',
    type: String,
  })
  public file: string;

  @ApiProperty({
    description: 'image for Card',
    example: 'test relevent for detailed description',
    type: String,
  })
  public image: string;

  @ApiProperty({
    description: 'Card creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public createdAt: Date;

  @ApiProperty({
    description: 'Card last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  public updatedAt: Date;

  constructor(values: IResponseCard) {
    Object.assign(this, values);
  }

  public static map(card: ICard): ResponseCardMapper {
    return new ResponseCardMapper({
      id: card?.id,
      name: card?.name,
      type: card?.type,
      status: card?.status,
      notes: card?.notes,
      file: card?.file,
      image: card?.image,
      createdAt: card?.createdAt,
      updatedAt: card?.updatedAt,
    });
  }
}
