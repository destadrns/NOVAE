import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
  } as unknown as ExecutionContext);

  it('should allow access if no roles are required on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(null);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if roles are required but user is not in request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.admin]);
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow admin user to access admin-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.admin]);
    const context = createMockContext({ id: '1', role: UserRole.admin });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when customer attempts to access admin-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.admin]);
    const context = createMockContext({ id: '2', role: UserRole.customer });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow customer user to access customer-allowed route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.customer, UserRole.admin]);
    const context = createMockContext({ id: '2', role: UserRole.customer });

    expect(guard.canActivate(context)).toBe(true);
  });
});
