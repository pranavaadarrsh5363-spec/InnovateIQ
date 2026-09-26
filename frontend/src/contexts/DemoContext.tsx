import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { DemoState, DemoStageInfo } from '../types';
import { demoApi } from '../services/api';
import { useInnovationContext } from './InnovationContext';
import { useNavigate } from 'react-router-dom';

interface DemoContextType {
  demoState: DemoState | null;
  isDemoActive: boolean;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  autoPlay: boolean;
  setAutoPlay: (auto: boolean) => void;
  playSpeed: number;
  setPlaySpeed: (speed: number) => void;
  startDemo: () => Promise<void>;
  stepDemo: (stageIndex?: number, navigateToPage?: boolean) => Promise<void>;
  pauseDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  jumpToStage: (stage: DemoStageInfo, navigateToPage?: boolean) => Promise<void>;
  loading: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const { selectProblem } = useInnovationContext();
  const navigate = useNavigate();

  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(3000); // default 3s per stage
  const [loading, setLoading] = useState<boolean>(false);

  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial poll / fetch of status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await demoApi.getStatus();
      if (res.data) {
        setDemoState(res.data);
      }
    } catch (e) {
      // Backend might be initializing
    }
  };

  // AutoPlay effect
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    if (autoPlay && demoState?.status === 'running') {
      if (demoState.stageIndex < demoState.totalStages - 1) {
        autoPlayTimerRef.current = setInterval(() => {
          stepDemo(undefined, false);
        }, playSpeed);
      } else {
        setAutoPlay(false);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, demoState?.status, demoState?.stageIndex, playSpeed]);

  const startDemo = async () => {
    setLoading(true);
    try {
      await selectProblem('prob-water-01');
      const res = await demoApi.start();
      setDemoState(res.data);
      setIsPanelOpen(true);
      setAutoPlay(true);
    } catch (err) {
      console.error('Failed to start demo:', err);
    } finally {
      setLoading(false);
    }
  };

  const stepDemo = async (stageIndex?: number, navigateToPage: boolean = false) => {
    try {
      const res = await demoApi.step(stageIndex);
      const updatedState: DemoState = res.data;
      setDemoState(updatedState);

      if (navigateToPage && updatedState.currentStage?.path) {
        navigate(updatedState.currentStage.path);
      }

      if (updatedState.stageIndex >= updatedState.totalStages - 1) {
        setAutoPlay(false);
      }
    } catch (err) {
      console.error('Failed to step demo:', err);
    }
  };

  const jumpToStage = async (stage: DemoStageInfo, navigateToPage: boolean = true) => {
    await stepDemo(stage.index, navigateToPage);
  };

  const pauseDemo = async () => {
    setAutoPlay(false);
    try {
      const res = await demoApi.pause();
      setDemoState(res.data);
    } catch (err) {
      console.error('Failed to pause demo:', err);
    }
  };

  const resetDemo = async () => {
    setAutoPlay(false);
    setLoading(true);
    try {
      const res = await demoApi.reset();
      setDemoState(res.data);
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(prev => !prev);
  };

  const isDemoActive = Boolean(demoState && demoState.status !== 'idle');

  return (
    <DemoContext.Provider
      value={{
        demoState,
        isDemoActive,
        isPanelOpen,
        setIsPanelOpen,
        togglePanel,
        autoPlay,
        setAutoPlay,
        playSpeed,
        setPlaySpeed,
        startDemo,
        stepDemo,
        pauseDemo,
        resetDemo,
        jumpToStage,
        loading,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
