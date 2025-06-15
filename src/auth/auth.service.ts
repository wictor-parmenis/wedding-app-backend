import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService
  ) {}
  async register(username: string, email: string, password: string, phoneNumber?: string) {
    try {
      // 1. Verifica se o usuário já existe no banco
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // 2. Cria o usuário no Firebase
      const userRecord = await this.firebaseService.getAuth().createUser({
        email,
        password,
        displayName: username,
        phoneNumber,
      });      // 3. Cria o usuário no banco de dados
      const user = await this.userService.create({
        username,
        email,
        external_id: userRecord.uid,
        phone_number: phoneNumber,
        email_verified: userRecord.emailVerified,
      });

      return {
        id: user.id,
        uid: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
        phoneNumber: user.phone_number,
        emailVerified: user.email_verified,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async generateTestToken(email: string) {
    try {
      const user = await this.firebaseService.getAuth().getUserByEmail(email);
      
      const customToken = await this.firebaseService.getAuth().createCustomToken(user.uid);

      return {
        message: 'Para testar a API, use o UID como token',
        uid: user.uid,
        customToken,
        user: {
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          emailVerified: user.emailVerified,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  async validateFirebaseToken(token: string) {
    try {
      let uid: string;

      try {
        const decodedToken = await this.firebaseService.getAuth().verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (error) {
        uid = token;
      }

      const user = await this.firebaseService.getAuth().getUser(uid);
      if (!user.email) {
        throw new UnauthorizedException('User email not found');
      }

      const userInDatabase = await this.userService.findByEmail(user.email);

      if (!userInDatabase) {
        throw new UnauthorizedException('User not found');
      }
      
      return {
        uid: userInDatabase?.external_id,
        email: userInDatabase.email,
        id: userInDatabase.id,
        username: userInDatabase.username,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateUserProfile(uid: string, data: { displayName?: string; photoURL?: string }) {
    return this.firebaseService.getAuth().updateUser(uid, data);
  }

  async updatePassword(uid: string, newPassword: string) {
    try {
      await this.firebaseService.getAuth().updateUser(uid, {
        password: newPassword,
      });
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new UnauthorizedException('Failed to update password');
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await this.firebaseService.getAuth().getUserByEmail(email);
      
     
      return { 
        message: 'If the email exists, a password reset link will be sent',
        info: 'Note: In production, use Firebase Client SDK to send reset email'
      };
    } catch (error) {
      return { 
        message: 'If the email exists, a password reset link will be sent',
        info: 'Note: In production, use Firebase Client SDK to send reset email'
      };
    }
  }
}
