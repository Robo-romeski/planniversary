import { UserRepository } from '../../repositories/user.repository';
import { CreateUserDTO, User, AccountStatus } from '../../models/user.model';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prisma: jest.Mocked<PrismaClient>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashedPassword',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    email_verified: false,
    verification_token: null,
    verification_token_expires_at: null,
    reset_token: null,
    reset_token_expires_at: null,
    account_status: 'pending' as AccountStatus,
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
  };

  beforeEach(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    userRepository = new UserRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await userRepository.findAll();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findById(1);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userRepository.findByUsername('testuser');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserData: CreateUserDTO = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
        first_name: 'New',
        last_name: 'User',
      };

      prisma.user.create.mockResolvedValue({ ...mockUser, ...createUserData });

      const result = await userRepository.createUser(createUserData);

      expect(result).toMatchObject(expect.objectContaining({
        email: createUserData.email,
        username: createUserData.username,
      }));
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserData.email,
          username: createUserData.username,
          account_status: 'pending',
        }),
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
      };

      const updatedUser = { ...mockUser, ...updateData };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await userRepository.updateUser(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should return null if user not found', async () => {
      prisma.user.update.mockRejectedValue(new Error('User not found'));

      const result = await userRepository.updateUser(999, { first_name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const newHashedPassword = 'newhashpassword';
      prisma.user.update.mockResolvedValue({ ...mockUser, password_hash: newHashedPassword });

      const result = await userRepository.updatePassword('1', newHashedPassword);
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password_hash: newHashedPassword }
      });
    });
  });

  describe('setEmailVerification', () => {
    it('should update email verification status', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, email_verified: true });

      const result = await userRepository.setEmailVerification('1', true);
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email_verified: true }
      });
    });
  });

  describe('setVerificationToken', () => {
    it('should set verification token', async () => {
      const token = 'verification-token';
      const expiresAt = new Date();
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        verification_token: token,
        verification_token_expires_at: expiresAt
      });

      const result = await userRepository.setVerificationToken('1', token, expiresAt);
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          verification_token: token,
          verification_token_expires_at: expiresAt
        }
      });
    });
  });

  describe('setResetToken', () => {
    it('should set reset token', async () => {
      const token = 'reset-token';
      const expiresAt = new Date();
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        reset_token: token,
        reset_token_expires_at: expiresAt
      });

      const result = await userRepository.setResetToken('1', token, expiresAt);
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          reset_token: token,
          reset_token_expires_at: expiresAt
        }
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const lastLogin = new Date();
      prisma.user.update.mockResolvedValue({ ...mockUser, last_login: lastLogin });

      const result = await userRepository.updateLastLogin('1');
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { last_login: expect.any(Date) }
      });
    });
  });

  describe('updateAccountStatus', () => {
    it('should update account status', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, account_status: 'active' });

      const result = await userRepository.updateAccountStatus('1', 'active');
      expect(result).toBeTruthy();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { account_status: 'active' }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await userRepository.deleteUser(1);

      expect(result).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false if user not found', async () => {
      prisma.user.delete.mockRejectedValue(new Error('User not found'));

      const result = await userRepository.deleteUser(999);

      expect(result).toBe(false);
    });
  });
}); 