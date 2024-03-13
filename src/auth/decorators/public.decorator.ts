import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'roles';
export const Public = (role:any) => SetMetadata(IS_PUBLIC_KEY, role);