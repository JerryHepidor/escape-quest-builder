import React, { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Sparkles } from 'lucide-react';

const generateNodes = (scenes, selectedId) => {
  return Object.values(scenes).map((scene, index) => ({
    id: scene.id,
    type: 'default',
    position: scene.position || { x: 80 + index * 260, y: 120 },
    data: { label: scene.title },
    style: {
      background: selectedId === scene.id ? '#1d4ed8' : '#1e293b',
      color: '#f8fafc',
      border: selectedId === scene.id ? '2px solid #60a5fa' : '1px solid #475569',
      borderRadius: '10px',
      padding: '14px 18px',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '180px',
      textAlign: 'center',
      boxShadow: selectedId === scene.id ? '0 0 15px rgba(96, 165, 250, 0.5)' : '0 4px 6px rgba(0,0,0,0.3)',
      cursor: 'pointer',
    },
  }));
};

const generateEdges = (scenes) => {
  const edges = [];
  Object.values(scenes).forEach((scene) => {
    scene.actions?.forEach((action) => {
      if (action.targetSceneId && scenes[action.targetSceneId]) {
        edges.push({
          id: `edge-${scene.id}-${action.id}-${action.targetSceneId}`,
          source: scene.id,
          target: action.targetSceneId,
          label: action.label,
          animated: action.type === 'conditional_transition',
          style: {
            stroke: action.type === 'conditional_transition' ? '#f59e0b' : '#38bdf8',
            strokeWidth: 2,
          },
          labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 500 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: action.type === 'conditional_transition' ? '#f59e0b' : '#38bdf8',
          },
        });
      }
    });
  });
  return edges;
};

export function FlowEditor({ quest, setQuest, selectedSceneId, onSelectScene }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(generateNodes(quest.scenes, selectedSceneId));
    setEdges(generateEdges(quest.scenes));
  }, [quest.scenes, selectedSceneId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) return;

      setQuest((prev) => {
        const sourceScene = prev.scenes[params.source];
        const targetScene = prev.scenes[params.target];
        if (!sourceScene || !targetScene) return prev;

        const newAction = {
          id: `act_${Date.now()}`,
          type: 'transition',
          label: `В: ${targetScene.title}`,
          targetSceneId: params.target,
        };

        return {
          ...prev,
          scenes: {
            ...prev.scenes,
            [params.source]: {
              ...sourceScene,
              actions: [...(sourceScene.actions || []), newAction],
            },
          },
        };
      });
    },
    [setQuest]
  );

  const onNodeClick = (_, node) => {
    onSelectScene(node.id);
  };

  const handleAddScene = () => {
    const newId = `scene_${Date.now()}`;
    const count = Object.keys(quest.scenes).length;
    const newScene = {
      id: newId,
      title: `Новая сцена ${count + 1}`,
      description: 'Новая локация квеста...',
      background: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      position: { x: 80 + (count % 3) * 260, y: 120 + Math.floor(count / 3) * 160 },
      actions: [],
    };

    setQuest((prev) => ({
      ...prev,
      scenes: {
        ...prev.scenes,
        [newId]: newScene,
      },
    }));
    onSelectScene(newId);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b0f19' }}>
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <button
          type="button"
          onClick={handleAddScene}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '9px 15px',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}
        >
          <Plus size={16} /> Добавить сцену
        </button>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '12px',
          color: '#94a3b8',
          background: 'rgba(17, 24, 39, 0.85)',
          padding: '7px 12px',
          borderRadius: 6,
          border: '1px solid #1f2937'
        }}>
          <Sparkles size={14} color="#38bdf8" /> Соединяйте точки между комнатами для настройки переходов
        </div>
      </div>

      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          defaultViewport={{ x: 50, y: 50, zoom: 0.95 }}
        >
          <Background color="#334155" gap={20} size={1.5} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}