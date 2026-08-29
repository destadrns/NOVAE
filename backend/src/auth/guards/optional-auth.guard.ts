import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return true;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return true;
    }

    try {
      const decodedUser = await this.authService.verifyToken(token);
      const dbUser = await this.authService.getOrCreateUser(decodedUser);

      if (
        dbUser &&
        dbUser.status !== UserStatus.suspended &&
        dbUser.status !== UserStatus.inactive
      ) {
        request.user = dbUser;
      }
    } catch {
      // For optional auth, token errors do not throw, request continues as guest
    }

    return true;
  }
}
