import { persistentStore, query } from '../db/connection';
import { db } from '../data/seed';
import { Problem } from '../types';

export class ProblemRepository {
  /**
   * Find all problems with filtering and pagination
   */
  async findAll(filter?: {
    domain?: string;
    organizationId?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDemo?: boolean;
  }): Promise<{ items: Problem[]; total: number; page?: number; pageSize?: number; totalPages?: number } | Problem[]> {
    const list = persistentStore.get('problems') || [];
    let allProblems: Problem[] = list;

    // Merge with in-memory seed problems if store is freshly initialized
    if (allProblems.length === 0 && (db as any).problems?.length > 0) {
      allProblems = [...(db as any).problems];
      persistentStore.set('problems', allProblems);
    }

    let filtered = allProblems;

    if (filter?.isDemo !== undefined) {
      filtered = filtered.filter((p: any) => Boolean(p.isDemo) === filter.isDemo);
    }
    if (filter?.domain && filter.domain !== 'All') {
      filtered = filtered.filter((p: Problem) => p.domain?.toLowerCase() === filter.domain?.toLowerCase());
    }
    if (filter?.priority && filter.priority !== 'All') {
      filtered = filtered.filter((p: Problem) => p.priority?.toLowerCase() === filter.priority?.toLowerCase());
    }
    if (filter?.organizationId) {
      filtered = filtered.filter((p: Problem) => (p as any).organizationId === filter.organizationId);
    }
    if (filter?.status && filter.status !== 'All') {
      filtered = filtered.filter((p: Problem) => p.status?.toLowerCase() === filter.status?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter((p: Problem) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.domain?.toLowerCase().includes(q) ||
        p.organization?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (filter?.sortBy) {
      const sortField = filter.sortBy as keyof Problem;
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const valA = (a[sortField] || '') as string;
        const valB = (b[sortField] || '') as string;
        return valA.localeCompare(valB) * order;
      });
    }

    // Pagination
    if (filter?.page !== undefined) {
      const page = Math.max(1, filter.page || 1);
      const pageSize = Math.max(1, filter.pageSize || 25);
      const total = filtered.length;
      const totalPages = Math.ceil(total / pageSize);
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize, totalPages };
    }

    return filtered;
  }

  /**
   * Find problem by ID
   */
  async findById(id: string): Promise<Problem | null> {
    const list = persistentStore.get('problems') || [];
    const found = list.find((p: Problem) => p.id === id);
    if (found) return found;

    const memList = (db as any).problems || [];
    return memList.find((p: Problem) => p.id === id) || null;
  }

  /**
   * Create a new problem
   */
  async create(problem: Problem): Promise<Problem> {
    const list = persistentStore.get('problems') || [];
    list.unshift(problem);
    persistentStore.set('problems', list);

    if ((db as any).problems && !(db as any).problems.some((p: any) => p.id === problem.id)) {
      (db as any).problems.unshift(problem);
    }

    try {
      await query(
        `INSERT INTO problems (id, title, description, domain, organization, location, severity, target_population, organization_id, is_demo, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          problem.id,
          problem.title,
          problem.description,
          problem.domain,
          problem.organization,
          problem.location,
          problem.priority || 'High',
          problem.targetPopulation || null,
          (problem as any).organizationId || null,
          (problem as any).isDemo ?? false,
          new Date().toISOString(),
        ]
      );
    } catch (e) {
      // Postgres sync fallback
    }

    return problem;
  }

  /**
   * Update problem
   */
  async update(id: string, updates: Partial<Problem>): Promise<Problem | null> {
    const list = persistentStore.get('problems') || [];
    const idx = list.findIndex((p: Problem) => p.id === id);
    if (idx === -1) return null;

    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    persistentStore.set('problems', list);

    if ((db as any).problems) {
      const memIdx = (db as any).problems.findIndex((p: any) => p.id === id);
      if (memIdx !== -1) (db as any).problems[memIdx] = updated;
    }

    return updated;
  }

  /**
   * Delete / Archive problem
   */
  async delete(id: string): Promise<boolean> {
    const list = persistentStore.get('problems') || [];
    const filtered = list.filter((p: Problem) => p.id !== id);
    const deleted = list.length !== filtered.length;
    if (deleted) {
      persistentStore.set('problems', filtered);
      if ((db as any).problems) {
        (db as any).problems = (db as any).problems.filter((p: any) => p.id !== id);
      }
      try {
        await query(`DELETE FROM problems WHERE id = $1`, [id]);
      } catch (e) {
        // PG fallback
      }
    }
    return deleted;
  }
}

export const problemRepository = new ProblemRepository();
