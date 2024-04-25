import { ApiProperty } from '@nestjs/swagger';
import { Page } from '../entities/page.entity';

export class PageMapper {
  @ApiProperty({
    description: 'Page id',
    example: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'Type of the page',
    example: 'terms_and_conditions',
    type: String,
  })
  public type: string;

  @ApiProperty({
    description: 'Title of the page',
    example: 'Terms and Conditions',
    type: String,
  })
  public title: string;

  @ApiProperty({
    description: 'HTML content of the page',
    example: '<p>This is the content of the page.</p>',
    type: String,
  })
  public content: string;

  @ApiProperty({
    description: 'Page creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public createdAt: string;

  @ApiProperty({
    description: 'Page last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  public updatedAt: string;

  constructor(page: Page) {
    this.id = page.id;
    this.type = page.type;
    this.title = page.title;
    this.content = page.content;
    this.createdAt = page.createdAt.toISOString();
    this.updatedAt = page.updatedAt.toISOString();
  }

  public static map(page: Page): PageMapper {
    return new PageMapper(page);
  }

  public static mapArray(pages: Page[]): PageMapper[] {
    return pages.map((page) => PageMapper.map(page));
  }
}
