'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TerminalEntry {
   command: string;
   output: string;
}

interface TerminalContextType {
   terminalEntries: TerminalEntry[];
   addTerminalEntry: (entry: TerminalEntry) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(
   undefined
);

export function TerminalProvider({
   children,
   initialEntries = [],
}: {
   children: ReactNode;
   initialEntries?: TerminalEntry[];
}) {
   const [terminalEntries, setTerminalEntries] =
      useState<TerminalEntry[]>(initialEntries);

   const addTerminalEntry = (entry: TerminalEntry) => {
      setTerminalEntries((prev) => [...prev, entry].slice(-30));
   };

   return (
      <TerminalContext.Provider value={{ terminalEntries, addTerminalEntry }}>
         {children}
      </TerminalContext.Provider>
   );
}

export function useTerminal() {
   const context = useContext(TerminalContext);
   if (!context) {
      throw new Error('useTerminal must be used within a TerminalProvider');
   }
   return context;
}
