import { Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise } from '@loopback/core';
import { UserProfile } from '@loopback/security';

const roleHierarchy = ['User', 'Tournament Director', 'Admin', 'Super Admin'];

export class RoleAuthorizationInterceptor implements Provider<Interceptor> {
  value() {
    return this.intercept.bind(this);
  }

  async intercept(context: InvocationContext, next: () => ValueOrPromise<InvocationResult>): Promise<InvocationResult> {
    const methodName = context.methodName;
    console.log(`Inspecting context for method: ${methodName}`);
    console.log(JSON.stringify(context, null, 2));  // Log the entire context

    const requiredRole = await context.get<string>('requiredRole', {optional: true});

    const userProfile: UserProfile | undefined = await context.get<UserProfile>('userProfile', {optional: true});
    console.log(`Method: ${methodName}`);
    console.log(`Required Role: ${requiredRole}`);
    console.log(`User Profile: ${JSON.stringify(userProfile)}`);

    if (!requiredRole || !userProfile) {
      throw new Error('Invalid role configuration');
    }

    const userRoleIndex = roleHierarchy.indexOf(userProfile.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex === -1 || requiredRoleIndex === -1) {
      throw new Error('Invalid role configuration');
    }

    if (userRoleIndex >= requiredRoleIndex) {
      return next();
    } else {
      throw new Error('Access Denied: Insufficient permissions');
    }
  }
}