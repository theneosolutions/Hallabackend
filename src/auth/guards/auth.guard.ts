import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isJWT } from 'class-validator';
import { Request } from 'express';
import { isNull, isUndefined } from '../../common/utils/validation.util';
import { TokenTypeEnum } from '../../jwt/enums/token-type.enum';
import { JwtService } from '../../jwt/jwt.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(
      '🚀 ~ file: auth.guard.ts:27 ~ AuthGuard ~ canActivate ~ roles:',
      roles,
    );

    if (isUndefined(roles) || isNull(roles) || roles.length === 0) {
      return true;
    }

    const activate = await this.setHttpHeader(
      context.switchToHttp().getRequest(),
      roles,
    );

    if (!activate) {
      throw new UnauthorizedException();
    }

    return activate;
  }

  /**
   * Sets HTTP Header
   *
   * Checks if the header has a valid Bearer token, validates it and sets the User ID as the user.
   */
  private async setHttpHeader(req: any, isPublic: string): Promise<boolean> {
    const auth = req.headers?.authorization;

    if (isUndefined(auth) || isNull(auth) || auth.length === 0) {
      return false;
    }

    const authArr = auth.split(' ');
    const bearer = authArr[0];
    const token = authArr[1];

    if (isUndefined(bearer) || isNull(bearer) || bearer !== 'Bearer') {
      return false;
    }
    if (isUndefined(token) || isNull(token) || !isJWT(token)) {
      return false;
    }

    try {
      const { id, type } = await this.jwtService.verifyToken(
        token,
        TokenTypeEnum.ACCESS,
      );
      console.log(
        '🚀 ~ file: auth.guard.ts:82 ~ AuthGuard ~ id, type:',
        id,
        type,
        isPublic,
      );
      if (!isUndefined(type) || !isNull(type)) {
        if (type == isPublic || isPublic.includes(type)) {
          req['user'] = id;
          return true;
        } else {
          return false;
        }
      }
    } catch (_) {
      return false;
    }
  }
}
