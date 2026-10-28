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
      if (Array.isArray(users)) {
        return users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          organization: u.organization?.name || u.organizationName || 'TechSolutions Inc.',
          role: u.role,
          status: (u.status || 'ACTIVE').toLowerCase(),
          lastLogin: u.lastLogin || u.createdAt || 'Never',
          avatar: u.avatar,
        }));
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API getUsers failed, using local store:', e.message);
    }
    return [...usersStore];
  },

  async createUser(user: Partial<User>): Promise<User> {
    try {
      const created = await ApiClient.post<any>('users', {
        name: user.name,
        email: user.email,
        password: 'DemoPass123!',
        role: user.role || 'USER',
      });
      if (created && created.id) {
        const formattedUser: User = {
          id: created.id,
          name: created.name,
          email: created.email,
          organization: created.organization?.name || created.organizationName || 'TechSolutions Inc.',
          role: created.role,
          status: (created.status || 'ACTIVE').toLowerCase(),
          lastLogin: 'Never',
        };
        usersStore.unshift(formattedUser);
        return formattedUser;
      }
      throw new Error('User creation returned empty payload');
    } catch (e: any) {
      console.error('API createUser error:', e);
      throw e;
    }
  },

  async getRoles(): Promise<Role[]> {
    try {
      const roles = await ApiClient.get<Role[]>('roles');
      if (Array.isArray(roles)) {
        return roles;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API getRoles failed, using local store:', e.message);
    }
    return [...rolesStore];
  },

  async getOrganizations(): Promise<Organization[]> {
    try {
      const orgs = await ApiClient.get<Organization[]>('organizations');
      if (Array.isArray(orgs)) {
        return orgs.map((o: any) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          industry: o.industry || 'Enterprise Software & Cloud Services',
          domain: o.domain || `${o.slug}.com`,
          plan: o.plan || 'Starter',
          status: o.status || 'active',
          applicationsCount: Array.isArray(o.applications) ? o.applications.length : 1,
          usersCount: Array.isArray(o.users) ? o.users.length : 1,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }));
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API getOrganizations failed, using local store:', e.message);
    }
    return [...orgsStore];
  },

  async createOrganization(payload: {
    name: string;
    industry?: string;
    domain?: string;
    plan?: string;
  }): Promise<Organization> {
    const created = await ApiClient.post<any>('organizations', payload);
    const newOrg: Organization = {
      id: created.id,
      name: created.name,
      slug: created.slug,
      industry: created.industry || 'Enterprise Software',
      domain: created.domain || `${created.slug}.com`,
      plan: created.plan || 'Enterprise',
      status: created.status || 'active',
      applicationsCount: 0,
      usersCount: 1,
      createdAt: created.createdAt || new Date().toISOString(),
      updatedAt: created.updatedAt || new Date().toISOString(),
    };
    orgsStore.unshift(newOrg);
    return newOrg;
  },
};

