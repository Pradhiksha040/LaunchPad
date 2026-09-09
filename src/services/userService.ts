import { User, Role, Organization } from '@/types';
import { ApiClient } from '@/lib/api/client';
import { MOCK_USERS, MOCK_ROLES, MOCK_ORGANIZATIONS } from '@/mock/data';

let usersStore: User[] = [...MOCK_USERS];
let rolesStore: Role[] = [...MOCK_ROLES];
let orgsStore: Organization[] = [...MOCK_ORGANIZATIONS];

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const users = await ApiClient.get<User[]>('users');
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }
    } catch (e: any) {
      console.warn('API getUsers failed, using local store:', e.message);
    }
    return [...usersStore];
  },

  async createUser(user: Partial<User>): Promise<User> {
    try {
      const created = await ApiClient.post<User>('users', {
        name: user.name,
        email: user.email,
        password: 'DemoPass123!',
        role: user.role,
      });
      if (created && created.id) {
        usersStore.unshift(created);
        return created;
      }
    } catch (e: any) {
      console.warn('API createUser failed, using local store:', e.message);
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name || 'New User',
      email: user.email || 'user@company.com',
      organization: user.organization || 'TechSolutions Inc.',
      role: user.role || 'DEVELOPER',
      status: 'active',
      lastLogin: 'Never',
    };
    usersStore.unshift(newUser);
    return newUser;
  },

  async getRoles(): Promise<Role[]> {
    try {
      const roles = await ApiClient.get<Role[]>('roles');
      if (Array.isArray(roles) && roles.length > 0) {
        return roles;
      }
    } catch (e: any) {
      console.warn('API getRoles failed, using local store:', e.message);
    }
    return [...rolesStore];
  },

  async getOrganizations(): Promise<Organization[]> {
    try {
      const orgs = await ApiClient.get<Organization[]>('organizations');
      if (Array.isArray(orgs) && orgs.length > 0) {
        return orgs;
      }
    } catch (e: any) {
      console.warn('API getOrganizations failed, using local store:', e.message);
    }
    return [...orgsStore];
  },
};
