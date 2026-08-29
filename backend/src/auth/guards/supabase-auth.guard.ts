import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format. Expected "Bearer <token>"');
    }

    // Verify token with Supabase / JWT
    const decodedUser = await this.authService.verifyToken(token);

    // Resolve or provision PostgreSQL user
    const dbUser = await this.authService.getOrCreateUser(decodedUser);

    if (!dbUser) {
      throw new UnauthorizedException('User profile could not be resolved');
    }

    if (dbUser.status === UserStatus.suspended || dbUser.status === UserStatus.inactive) {
      throw new ForbiddenException('Access denied: Account is inactive or suspended');
    }

    // Attach verified user to request
    request.user = dbUser;
    return true;
  }
}
