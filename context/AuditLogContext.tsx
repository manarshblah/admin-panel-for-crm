
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { AuditLog } from '../types';

interface AuditLogContextType {
  logs: AuditLog[];
  addLog: (actionKey: string, params?: Record<string, string | number>) => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

const initialLogs: AuditLog[] = [
    { id: 3, user: 'admin1@system.com', action: { key: 'audit.log.initial.smtpChanged', params: {} }, timestamp: new Date('2023-10-19T15:00:00Z').toISOString() },
    { id: 2, user: 'admin2@system.com', action: { key: 'audit.log.initial.planCreated', params: { planName: 'البلاتينية' } }, timestamp: new Date('2023-10-20T09:15:00Z').toISOString() },
    { id: 1, user: 'admin1@system.com', action: { key: 'audit.log.initial.accountDeactivated', params: { companyName: 'ABC' } }, timestamp: new Date('2023-10-20T10:30:00Z').toISOString() },
];

export const AuditLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);

  const addLog = useCallback((actionKey: string, params: Record<string, string | number> = {}) => {
    const newLog: AuditLog = {
      id: Date.now(), // Use timestamp for unique ID
      user: 'admin1@system.com', // Hardcoded for this example
      action: { key: actionKey, params },
      timestamp: new Date().toISOString(),
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  return (
    <AuditLogContext.Provider value={{ logs, addLog }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = (): AuditLogContextType => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
};
