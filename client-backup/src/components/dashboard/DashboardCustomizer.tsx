import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../contexts/DashboardContext';
import Widget from './Widget';
import WidgetLibrary from './WidgetLibrary';
import { DashboardLayout, WidgetConfig } from '../../types/dashboard';
import { Grid, Paper, IconButton } from '@mui/material';
import { Add, Delete, Save, Undo, Redo } from '@mui/icons-material';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DashboardCustomizerProps {
  layout: DashboardLayout;
  onSave: (layout: DashboardLayout) => void;
}

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ layout, onSave }) => {
  const { user } = useAuth();
  const { dashboardTemplates, saveTemplate } = useDashboard();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(layout.widgets);
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [undoStack, setUndoStack] = useState<DashboardLayout[]>([]);
  const [redoStack, setRedoStack] = useState<DashboardLayout[]>([]);

  useEffect(() => {
    setWidgets(layout.widgets);
  }, [layout.widgets]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleAddWidget = (widget: WidgetConfig) => {
    const newWidgets = [...widgets, widget];
    setWidgets(newWidgets);
    onSave({ ...layout, widgets: newWidgets });
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(newWidgets);
    onSave({ ...layout, widgets: newWidgets });
  };

  const handleWidgetUpdate = (widgetId: string, updates: Partial<WidgetConfig>) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    );
    setWidgets(newWidgets);
    onSave({ ...layout, widgets: newWidgets });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      if (lastState) {
        setRedoStack([...redoStack, layout]);
        setWidgets(lastState.widgets);
        onSave(lastState);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastState = redoStack.pop();
      if (lastState) {
        setUndoStack([...undoStack, layout]);
        setWidgets(lastState.widgets);
        onSave(lastState);
      }
    }
  };

  const handleSaveTemplate = async () => {
    const template = {
      name: `${user?.username}'s Custom Dashboard`,
      description: 'Custom dashboard layout',
      category: 'custom',
      layout: {
        ...layout,
        id: Date.now().toString()
      },
      tags: ['custom', 'personalized'],
      createdBy: user?.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveTemplate(template);
  };

  const DraggableWidget = ({ widget }: { widget: WidgetConfig }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: widget.id,
      data: widget
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      cursor: 'move'
    };

    return (
      <Paper
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        elevation={4}
        onClick={() => setSelectedWidget(widget)}
      >
        <Widget
          widget={widget}
          onRemove={() => handleRemoveWidget(widget.id)}
          onUpdate={(updates) => handleWidgetUpdate(widget.id, updates)}
        />
      </Paper>
    );
  };

  const DroppableArea = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id: 'dashboard' });

    return (
      <div ref={setNodeRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <div style={{ flex: '0 0 250px', padding: '16px', borderRight: '1px solid #eee' }}>
        <h3>Widget Library</h3>
        <WidgetLibrary onAddWidget={handleAddWidget} />
        
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <IconButton onClick={handleUndo} disabled={undoStack.length === 0}>
            <Undo />
          </IconButton>
          <IconButton onClick={handleRedo} disabled={redoStack.length === 0}>
            <Redo />
          </IconButton>
          <IconButton onClick={handleSaveTemplate}>
            <Save />
          </IconButton>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <DroppableArea>
          <Grid container spacing={2}>
            {widgets.map((widget) => (
              <Grid item key={widget.id} xs={widget.layout.width}>
                <DraggableWidget widget={widget} />
              </Grid>
            ))}
          </Grid>
        </DroppableArea>
      </div>

      {selectedWidget && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          height: '100vh',
          backgroundColor: 'white',
          borderLeft: '1px solid #eee',
          padding: '16px'
        }}>
          <h3>Widget Settings</h3>
          <WidgetSettings
            widget={selectedWidget}
            onUpdate={(updates) => handleWidgetUpdate(selectedWidget.id, updates)}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardCustomizer;
