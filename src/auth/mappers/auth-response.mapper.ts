import { ApiProperty } from '@nestjs/swagger';
import { IAuthResponse } from '../interfaces/auth-response.interface';
import { IAuthResult } from '../interfaces/auth-result.interface';
import { AuthResponseUserMapper } from './auth-response-user.mapper';

export class AuthResponseMapper implements IAuthResponse {
  @ApiProperty({
    description: 'User',
    type: AuthResponseUserMapper,
  })
  public user: AuthResponseUserMapper;

  @ApiProperty({
    description: 'Access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: String,
  })
  public accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: String,
  })
  public refreshToken: string;

  @ApiProperty({
    description: 'Message text',
    example: 'Some dummy message',
    type: String,
  })
  public message?: string;

  constructor(values: IAuthResponse) {
    Object.assign(this, values);
  }

  public static map(result: IAuthResult): AuthResponseMapper {
    const authResponse: any = {
      user: AuthResponseUserMapper.map(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
    if (result.message) {
      authResponse.message = result.message;
    }
    return new AuthResponseMapper(authResponse);
  }
}
