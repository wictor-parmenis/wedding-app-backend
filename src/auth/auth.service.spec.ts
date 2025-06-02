import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;

  const mockFirebaseService = {
    getAuth: jest.fn().mockReturnValue({
      createUser: jest.fn(),
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockFirebaseResponse = {
      uid: 'test-uid-123',
      email: mockUserData.email,
      displayName: mockUserData.username,
    };

    it('should successfully register a new user', async () => {
      mockFirebaseService.getAuth().createUser.mockResolvedValueOnce(mockFirebaseResponse);

      const result = await service.register(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
      );

      expect(result).toEqual({
        uid: mockFirebaseResponse.uid,
        email: mockFirebaseResponse.email,
        username: mockFirebaseResponse.displayName,
      });
      expect(mockFirebaseService.getAuth().createUser).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password,
        displayName: mockUserData.username,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const error = { code: 'auth/email-already-exists' };
      mockFirebaseService.getAuth().createUser.mockRejectedValueOnce(error);

      await expect(
        service.register(mockUserData.username, mockUserData.email, mockUserData.password),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException for other Firebase errors', async () => {
      const error = { code: 'auth/some-other-error' };
      mockFirebaseService.getAuth().createUser.mockRejectedValueOnce(error);

      await expect(
        service.register(mockUserData.username, mockUserData.email, mockUserData.password),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        service.register(mockUserData.username, mockUserData.email, mockUserData.password),
      ).rejects.toThrowError('Error creating user');
    });
  });

  describe('validateFirebaseToken', () => {
    const mockUser = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
    };

    const mockDecodedToken = {
      uid: mockUser.uid,
      email: mockUser.email,
    };

    it('should validate ID token and return user data', async () => {
      mockFirebaseService.getAuth().verifyIdToken.mockResolvedValueOnce(mockDecodedToken);
      mockFirebaseService.getAuth().getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateFirebaseToken('valid-id-token');

      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        username: mockUser.displayName,
        emailVerified: mockUser.emailVerified,
      });

      expect(mockFirebaseService.getAuth().verifyIdToken).toHaveBeenCalledWith('valid-id-token');
      expect(mockFirebaseService.getAuth().getUser).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should fall back to UID validation if ID token validation fails', async () => {
      mockFirebaseService.getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
      mockFirebaseService.getAuth().getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateFirebaseToken(mockUser.uid);

      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email,
        username: mockUser.displayName,
        emailVerified: mockUser.emailVerified,
      });

      expect(mockFirebaseService.getAuth().getUser).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockFirebaseService.getAuth().verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
      mockFirebaseService.getAuth().getUser.mockRejectedValueOnce(new Error('User not found'));

      await expect(
        service.validateFirebaseToken('invalid-token')
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.validateFirebaseToken('invalid-token')
      ).rejects.toThrowError('Invalid token');
    });
  });
});
