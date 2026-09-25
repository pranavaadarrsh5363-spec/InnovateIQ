import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Problem, Project } from '../types';
import { problemsApi, projectsApi } from '../services/api';

interface InnovationContextType {
  activeProblemId: string;
  activeProblem: Problem | null;
  activeProjectId: string;
  activeProject: Project | null;
  allProblems: Problem[];
  loading: boolean;
  selectProblem: (problemOrId: string | Problem) => Promise<void>;
  selectProject: (projectOrId: string | Project) => Promise<void>;
  refreshContext: () => Promise<void>;
}

const InnovationContext = createContext<InnovationContextType | undefined>(undefined);

export function InnovationProvider({ children }: { children: ReactNode }) {
  const [activeProblemId, setActiveProblemId] = useState<string>(() => {
    return localStorage.getItem('innovateiq_active_problem_id') || 'prob-water-01';
  });
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem('innovateiq_active_project_id') || 'proj-1';
  });
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const probRes = await problemsApi.getAll();
      const probs: Problem[] = Array.isArray(probRes.data) ? probRes.data : (probRes.data.data || []);
      setAllProblems(probs);

      const savedProbId = localStorage.getItem('innovateiq_active_problem_id') || 'prob-water-01';
      const foundProb = probs.find(p => p.id === savedProbId) || probs[0] || null;
      if (foundProb) {
        setActiveProblem(foundProb);
        setActiveProblemId(foundProb.id);
        localStorage.setItem('innovateiq_active_problem_id', foundProb.id);
      }

      // Try load active project
      try {
        const projRes = await projectsApi.getAll();
        const projs: Project[] = Array.isArray(projRes.data) ? projRes.data : [];
        const savedProjId = localStorage.getItem('innovateiq_active_project_id') || 'proj-1';
        const foundProj = projs.find(p => p.id === savedProjId) || projs[0] || null;
        if (foundProj) {
          setActiveProject(foundProj);
          setActiveProjectId(foundProj.id);
        }
      } catch (e) {
        // user might not be logged in yet
      }
    } catch (err) {
      console.error('Failed to initialize InnovationContext:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProblem = async (problemOrId: string | Problem) => {
    if (typeof problemOrId === 'string') {
      const id = problemOrId;
      setActiveProblemId(id);
      localStorage.setItem('innovateiq_active_problem_id', id);

      const found = allProblems.find(p => p.id === id);
      if (found) {
        setActiveProblem(found);
      } else {
        try {
          const res = await problemsApi.getById(id);
          const prob = res.data.data || res.data;
          setActiveProblem(prob);
        } catch (e) {
          console.error('Failed to load problem:', e);
        }
      }
    } else {
      setActiveProblemId(problemOrId.id);
      setActiveProblem(problemOrId);
      localStorage.setItem('innovateiq_active_problem_id', problemOrId.id);
    }
  };

  const selectProject = async (projectOrId: string | Project) => {
    if (typeof projectOrId === 'string') {
      const id = projectOrId;
      setActiveProjectId(id);
      localStorage.setItem('innovateiq_active_project_id', id);

      try {
        const res = await projectsApi.getById(id);
        setActiveProject(res.data);
      } catch (e) {
        console.error('Failed to load project:', e);
      }
    } else {
      setActiveProjectId(projectOrId.id);
      setActiveProject(projectOrId);
      localStorage.setItem('innovateiq_active_project_id', projectOrId.id);
    }
  };

  const refreshContext = async () => {
    await loadInitialData();
  };

  return (
    <InnovationContext.Provider
      value={{
        activeProblemId,
        activeProblem,
        activeProjectId,
        activeProject,
        allProblems,
        loading,
        selectProblem,
        selectProject,
        refreshContext,
      }}
    >
      {children}
    </InnovationContext.Provider>
  );
}

export function useInnovationContext() {
  const context = useContext(InnovationContext);
  if (!context) {
    throw new Error('useInnovationContext must be used within an InnovationProvider');
  }
  return context;
}

export const useInnovation = useInnovationContext;

