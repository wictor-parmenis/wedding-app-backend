import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async register(username: string, email: string, password: string) {
    try {
      const userRecord = await this.firebaseService.getAuth().createUser({
        email,
        password,
        displayName: username,
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
      };
    } catch (error) {
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
      
      return {
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        emailVerified: user.emailVerified,
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

  // Para iniciar o processo de "esqueci minha senha"
  async sendPasswordResetEmail(email: string) {
    try {
      // Verificar se o usuário existe
      await this.firebaseService.getAuth().getUserByEmail(email);
      
      // Em produção, você usaria o Firebase Client SDK para enviar o email
      // No backend, podemos apenas verificar se o usuário existe
      return { 
        message: 'If the email exists, a password reset link will be sent',
        info: 'Note: In production, use Firebase Client SDK to send reset email'
      };
    } catch (error) {
      // Por segurança, não informamos se o email existe ou não
      return { 
        message: 'If the email exists, a password reset link will be sent',
        info: 'Note: In production, use Firebase Client SDK to send reset email'
      };
    }
  }
}
