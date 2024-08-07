import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';
import { v4 } from 'uuid';
import { IMessage } from './interfaces/message.interface';
import { isNull, isUndefined } from './utils/validation.util';
import { NotificationDto } from 'src/Notifications/dtos/create-notification.dto';
import { NotificationsService } from 'src/Notifications/notifications.service';

@Injectable()
export class CommonService {
  private readonly loggerService: LoggerService;
  private readonly notificationService: NotificationsService;

  constructor() {
    this.loggerService = new Logger(CommonService.name);
  }

  /**
   * Check Entity Existence
   *
   * Checks if a findOne query didn't return null or undefined
   */
  public checkEntityExistence<T>(
    entity: T | null | undefined,
    name: string,
  ): void {
    if (isNull(entity) || isUndefined(entity)) {
      throw new NotFoundException(`${name} not found`);
    }
  }

  /**
   * Throw Duplicate Error
   *
   * Checks is an error is of the code 1062, mySQL's duplicate value error,
   * and throws a conflict exception
   */
  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);

      if (error.code === '1062') {
        throw new ConflictException(message ?? 'Duplicated value in database');
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Throw Internal Error
   *
   * Function to abstract throwing internal server exception
   */
  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Format Name
   *
   * Takes a string trims it and capitalizes every word
   */
  public formatName(title: string): string {
    return title
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\s\s+/g, ' ')
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
  }

  /**
   * Generate Point Slug
   *
   * Takes a string and generates a slug with dtos as word separators
   */
  public generatePointSlug(str: string): string {
    return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
  }

  public generateMessage(message: string): IMessage {
    return { id: v4(), message };
  }

  public getDateInMySQLFormat(dateStr: any) {
    const d = new Date(dateStr + ' 00:00:00');
    const year = d?.getFullYear();
    let month = d?.getMonth() + 1;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (month < 10) month = '0' + month;
    let date = d?.getDate();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (date < 10) date = '0' + date;

    return `${year}-${month}-${date}`;
  }

  async sendChatMessageNotification(notificationDto: NotificationDto) {
    console.log('WAHMED >>>>>>>>>>>>>> Notification detail:', notificationDto);
    await this.notificationService.create(undefined, notificationDto);
  }
}
