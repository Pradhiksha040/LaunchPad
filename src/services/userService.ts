import { User, Role, Organization } from '@/types';
import { MOCK_USERS, MOCK_ROLES, MOCK_ORGANIZATIONS } from '@/mock/data';

let usersStore: User[] = [...MOCK_USERS];
let rolesStore: Role[] = [...MOCK_ROLES];
let orgsStore: Organization[] = [...MOCK_ORGANIZATIONS];

export const userService = {
  async getUsers(): Promise<User[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...usersStore];
  },

  async createUser(user: Partial<User>): Promise<User> {
    await new Promise((res) => setTimeout(res, 300));
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: user.name || 'New User',
      email: user.email || 'user@company.com',
      organization: user.organization || 'Acme Global Corp',
      role: user.role || 'Developer',
      status: 'active',
      lastLogin: 'Never',
    };
    usersStore.unshift(newUser);
    return newUser;
  },

  async getRoles(): Promise<Role[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...rolesStore];
  },

  async getOrganizations(): Promise<Organization[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...orgsStore];
  },
};
