import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardLayout, WidgetConfig } from '../types/dashboard';
import axios from 'axios';

interface DashboardContextType {
  dashboardTemplates: DashboardLayout[];
  selectedTemplate: DashboardLayout | null;
  saveTemplate: (template: DashboardLayout) => Promise<void>;
  updateTemplate: (template: Partial<DashboardLayout>) => Promise<void>;
  loadTemplate: (id: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  createNewDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardTemplates, setDashboardTemplates] = useState<DashboardLayout[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardLayout | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/dashboard/templates');
      setDashboardTemplates(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard templates:', error);
    }
  };

  const saveTemplate = async (template: DashboardLayout) => {
    try {
      await axios.post('/api/dashboard/templates', template);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to save dashboard template:', error);
    }
  };

  const updateTemplate = async (template: Partial<DashboardLayout>) => {
    try {
      await axios.put(`/api/dashboard/templates/${template.id}`, template);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to update dashboard template:', error);
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      const response = await axios.get(`/api/dashboard/templates/${id}`);
      setSelectedTemplate(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard template:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await axios.delete(`/api/dashboard/templates/${id}`);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete dashboard template:', error);
    }
  };

  const createNewDashboard = () => {
    const newTemplate: DashboardLayout = {
      id: Date.now().toString(),
      name: 'New Dashboard',
      description: 'A new dashboard',
      widgets: [],
      grid: {
        columns: 4,
        rows: 3,
        gap: 10,
      },
      theme: {
        primaryColor: '#2196F3',
        secondaryColor: '#03A9F4',
        backgroundColor: '#FFFFFF',
        textColor: '#333333',
        fontFamily: 'Arial, sans-serif',
      },
      filters: {
        global: true,
        position: 'top',
        presets: [],
      },
    };
    setSelectedTemplate(newTemplate);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardTemplates,
        selectedTemplate,
        saveTemplate,
        updateTemplate,
        loadTemplate,
        deleteTemplate,
        createNewDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
