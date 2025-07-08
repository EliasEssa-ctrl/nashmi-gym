import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExerciseEntry {
  playerName: string;
  split: string;
  exercises: {
    muscle: string;
    selected: string[];
  }[];
  startDate: string;
  endDate: string;
}

interface CoachContextType {
  savedEntries: ExerciseEntry[];
  setSavedEntries: React.Dispatch<React.SetStateAction<ExerciseEntry[]>>;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

export const CoachProvider = ({ children }: { children: ReactNode }) => {
  const [savedEntries, setSavedEntries] = useState<ExerciseEntry[]>([]);

  return (
    <CoachContext.Provider value={{ savedEntries, setSavedEntries }}>
      {children}
    </CoachContext.Provider>
  );
};

export const useCoachData = (): CoachContextType => {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoachData must be used within a CoachProvider');
  }
  return context;
};
