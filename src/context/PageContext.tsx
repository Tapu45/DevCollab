"use client";


import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  title: string;
  description: string;
  setPageInfo: (title: string, description: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('Dashboard');
  const [description, setDescription] = useState('Manage your projects...');

  const setPageInfo = (newTitle: string, newDescription: string) => {
    setTitle(newTitle);
    setDescription(newDescription);
  };

  return (
    <PageContext.Provider value={{ title, description, setPageInfo }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};