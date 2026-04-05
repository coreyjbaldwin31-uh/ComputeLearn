'use client';

import { createContext, useContext } from 'react';
import {
  useStorageHealth,
  type StorageHealthState,
  type StorageHealthActions,
} from './hooks/use-storage-health';

interface StorageHealthContextValue {
  health: StorageHealthState;
  actions: StorageHealthActions;
}

const StorageHealthContext = createContext<StorageHealthContextValue | null>(
  null,
);

export function StorageHealthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [health, actions] = useStorageHealth();
  return (
    <StorageHealthContext.Provider value={{ health, actions }}>
      {children}
    </StorageHealthContext.Provider>
  );
}

export function useStorageHealthContext() {
  const ctx = useContext(StorageHealthContext);
  if (!ctx)
    throw new Error(
      'useStorageHealthContext must be used within StorageHealthProvider',
    );
  return ctx;
}
