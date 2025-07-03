import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClerkAuth } from './clerk.decorator';
import { IAuthUser } from 'src/interfaces/auth.interface';

describe('ClerkAuthDecorator', () => {
  let mockContext: ExecutionContext;
  let mockGqlContext: GqlExecutionContext;

  beforeEach(() => {
    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(),
      })),
    } as unknown as ExecutionContext;

    mockGqlContext = {
      getContext: jest.fn(() => ({
        req: {},
      })),
      getArgs: jest.fn(),
      getRoot: jest.fn(),
      getInfo: jest.fn(),
    } as unknown as GqlExecutionContext;

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext);
  });

  it('should return the auth user object when authenticated', () => {
    const mockAuth = {
      userId: 'user123',
      sessionId: 'session456',
      orgId: 'org789',
    };
    mockGqlContext.getContext().req = { auth: mockAuth };

    class Test {
      testMethod(@ClerkAuth() user: IAuthUser) {
        return user;
      }
    }
    const testInstance = new Test();
    const result = testInstance.testMethod(mockContext as any);

    expect(result).toEqual({
      userId: 'user123',
      sessionId: 'session456',
      orgId: 'org789',
    });
  });

  it('should throw an error if user is not authenticated', () => {
    mockGqlContext.getContext().req = { auth: null };

    class Test {
      testMethod(@ClerkAuth() user: IAuthUser) {
        return user;
      }
    }
    const testInstance = new Test();

    expect(() => testInstance.testMethod(mockContext as any)).toThrow('User not authenticated');
  });

  it('should return the provided data if data is present', () => {
    const customData = { custom: 'data' };
    const mockAuth = {
      userId: 'user123',
      sessionId: 'session456',
      orgId: 'org789',
    };
    mockGqlContext.getContext().req = { auth: mockAuth };

    class Test {
      testMethod(@ClerkAuth(customData) user: IAuthUser) {
        return user;
      }
    }
    const testInstance = new Test();
    const result = testInstance.testMethod(mockContext as any);

    expect(result).toEqual(customData);
  });
});