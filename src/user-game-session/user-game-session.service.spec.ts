import { Test, TestingModule } from '@nestjs/testing';
import { UserGameSessionService } from './user-game-session.service';

describe('UserGameSessionService', () => {
  let service: UserGameSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGameSessionService],
    }).compile();

    service = module.get<UserGameSessionService>(UserGameSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
