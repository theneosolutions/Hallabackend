import { Test, TestingModule } from '@nestjs/testing';
import { PackagesUsersController } from './packages-users.controller';

describe('PackagesUsersController', () => {
  let controller: PackagesUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesUsersController],
    }).compile();

    controller = module.get<PackagesUsersController>(PackagesUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
