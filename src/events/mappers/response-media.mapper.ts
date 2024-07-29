import { ApiProperty } from '@nestjs/swagger';
import { IEventMedia } from '../interfaces/media.interface';

export class ResponseMediaMapper implements IEventMedia {
  @ApiProperty({
    description: 'event image url',
    example: 'https://hallabucket.s3.amazonaws.com/invitation.png',
    type: String,
  })
  public link: string;

  @ApiProperty({
    description: 'event image type',
    example: '.jpeg | .mp4',
    type: String,
  })
  public type: string;

  constructor(values: IEventMedia) {
    Object.assign(this, values);
  }

  public static map(file: IEventMedia): ResponseMediaMapper {
    return new ResponseMediaMapper({
      link: file.link,
      type: file.type,
    });
  }
}
