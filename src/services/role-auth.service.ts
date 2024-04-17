import { injectable } from '@loopback/core';
import { CustomUserProfile } from '../types';

@injectable()
export class AuthorizationService {
    private roleHierarchy = ['User', 'Tournament Director', 'Admin', 'Super Admin'];

    /**
     * Checks if the user has the required role or a higher role.
     * @param user - The user profile to check.
     * @param requiredRole - The required role for access.
     * @returns true if the user has the required role or higher.
     */
    hasRequiredRole(user: CustomUserProfile, requiredRole: string): boolean {
        if (!requiredRole || !user) {
            throw new Error('Invalid role arguments');
        }

        const userRoleIndex = this.roleHierarchy.indexOf(user.role);
        const requiredRoleIndex = this.roleHierarchy.indexOf(requiredRole);

        if (userRoleIndex === -1 || requiredRoleIndex === -1) {
            throw new Error('Invalid role configuration');
        }

        return userRoleIndex >= requiredRoleIndex;
    }
}