import { persistentStore, query } from '../db/connection';
import { Organization } from '../types';

export class OrganizationRepository {
  /**
   * Find all organizations
   */
  async findAll(): Promise<Organization[]> {
    const list = persistentStore.get('organizations') || [];
    if (list.length === 0) {
      // Seed default initial organizations if empty
      const defaultOrgs: Organization[] = [
        {
          id: 'org-ministry-jal',
          name: 'Ministry of Jal Shakti, Government of India',
          type: 'Government',
          domain: 'Water Resources & Sanitation',
          location: 'New Delhi, India',
          subscriptionTier: 'ENTERPRISE',
          contactEmail: 'nodal@jalshakti.gov.in',
          description: 'Department of Drinking Water and Sanitation spearheading national rural water quality and potability tracking.',
          memberCount: 42,
          activeProblemsCount: 3,
          activePilotsCount: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'org-iit-delhi',
          name: 'IIT Delhi Innovation & Incubation Centre',
          type: 'University',
          domain: 'DeepTech, IoT & Embedded Systems',
          location: 'Hauz Khas, New Delhi',
          subscriptionTier: 'ENTERPRISE',
          contactEmail: 'incubation@iitd.ac.in',
          description: 'Premier technological incubation ecosystem fostering national problem solvers and edge computing pilots.',
          memberCount: 128,
          activeProblemsCount: 5,
          activePilotsCount: 4,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'org-rajasthan-phed',
          name: 'Public Health Engineering Department (PHED), Rajasthan',
          type: 'Government',
          domain: 'Rural Water Supply',
          location: 'Jaipur, Rajasthan',
          subscriptionTier: 'PROFESSIONAL',
          contactEmail: 'rural-water@phed.rajasthan.gov.in',
          description: 'Regional administrative body managing rural drinking water supply schemes across eastern Rajasthan.',
          memberCount: 18,
          activeProblemsCount: 2,
          activePilotsCount: 1,
          createdAt: new Date().toISOString(),
        },
      ];
      persistentStore.set('organizations', defaultOrgs);
      return defaultOrgs;
    }
    return list;
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | null> {
    const list = await this.findAll();
    return list.find((o: Organization) => o.id === id) || null;
  }

  /**
   * Create a new organization
   */
  async create(org: Organization): Promise<Organization> {
    const list = await this.findAll();
    list.unshift(org);
    persistentStore.set('organizations', list);

    try {
      await query(
        `INSERT INTO organizations (id, name, type, domain, location, subscription_tier, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          org.id,
          org.name,
          org.type,
          org.domain || null,
          org.location || null,
          org.subscriptionTier || 'COMMUNITY',
          org.createdAt || new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return org;
  }

  /**
   * Update organization details
   */
  async update(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const list = await this.findAll();
    const index = list.findIndex((o: Organization) => o.id === id);
    if (index === -1) return null;

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    persistentStore.set('organizations', list);
    return updated;
  }
}

export const organizationRepository = new OrganizationRepository();
