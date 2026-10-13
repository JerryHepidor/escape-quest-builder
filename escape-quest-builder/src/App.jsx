import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { initialQuest } from './initialQuest';
import { QuestPlayer } from './QuestPlayer';
import { FlowEditor } from './FlowEditor';
import { SceneInspector } from './SceneInspector';
import { exportQuestToHtml, exportQuestToJson } from './exportHtml';
import {
  Play, Network, LayoutTemplate, Download,
  FileCode, Upload, RotateCcw, Check
} from 'lucide-react';

export function App() {
  // Загружаем квест из LocalStorage или берем начальный
  const [quest, setQuest] = useState(() => {
    const saved = localStorage.getItem('escape_quest_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialQuest;
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [selectedSceneId, setSelectedSceneId] = useState(quest.initialSceneId);
  const [savedBadge, setSavedBadge] = useState(false);
  const fileInputRef = useRef(null);

  // Автосохранение при любом изменении
  useEffect(() => {
    localStorage.setItem('escape_quest_data', JSON.stringify(quest));
    setSavedBadge(true);
    const timer = setTimeout(() => setSavedBadge(false), 2000);
    return () => clearTimeout(timer);
  }, [quest]);

  const handleUpdateScene = (updatedScene) => {
    setQuest((prev) => ({
      ...prev,
      scenes: {
        ...prev.scenes,
        [updatedScene.id]: updatedScene,
      },
    }));
  };

  const handleDeleteScene = (sceneIdToDelete) => {
    const keys = Object.keys(quest.scenes);
    if (keys.length <= 1) {
      alert('Нельзя удалить последнюю сцену квеста!');
      return;
    }

    setQuest((prev) => {
      const nextScenes = { ...prev.scenes };
      delete nextScenes[sceneIdToDelete];

      // Очистка переходов на удаленную сцену
      Object.keys(nextScenes).forEach((id) => {
        nextScenes[id] = {
          ...nextScenes[id],
          actions: nextScenes[id].actions?.filter((a) => a.targetSceneId !== sceneIdToDelete) || [],
        };
      });

      return { ...prev, scenes: nextScenes };
    });

    const remaining = Object.keys(quest.scenes).filter((id) => id !== sceneIdToDelete);
    setSelectedSceneId(remaining[0]);
  };

  // Импорт квеста из JSON
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.scenes && parsed.initialSceneId) {
          setQuest(parsed);
          setSelectedSceneId(parsed.initialSceneId);
          alert('Квест успешно загружен!');
        } else {
          alert('Ошибка: неверный формат файла квеста.');
        }
      } catch (err) {
        alert('Не удалось прочитать JSON файл.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Сбросить текущий квест к начальному шаблону? Все несохраненные изменения пропадут.')) {
      setQuest(initialQuest);
      setSelectedSceneId(initialQuest.initialSceneId);
      localStorage.removeItem('escape_quest_data');
    }
  };

  const selectedScene = quest.scenes[selectedSceneId] || null;

  return (
    <div className="app-container">
      {/* Главная навигационная панель */}
      <nav className="top-nav">
        <div className="nav-brand">
          <LayoutTemplate size={22} className="brand-icon" />
          <span>КвестКонструктор</span>
          <span className="quest-tag">{quest.title}</span>
          {savedBadge && (
            <span className="save-indicator">
              <Check size={12} /> Сохранено
            </span>
          )}
        </div>

        <div className="nav-actions-group">
          {/* Режимы работы */}
          <div className="nav-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'editor' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <Network size={16} /> Граф сценария
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'player' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('player')}
            >
              <Play size={16} /> Запустить тест
            </button>
          </div>

          <div className="nav-separator"></div>

          {/* Публикация и экспорт */}
          <div className="export-tools">
            <button
              type="button"
              className="publish-btn"
              onClick={() => exportQuestToHtml(quest)}
              title="Скачать готовый HTML файл для отправки игрокам"
            >
              <Download size={16} /> Опубликовать (HTML)
            </button>

            <button
              type="button"
              className="icon-action-btn"
              onClick={() => exportQuestToJson(quest)}
              title="Экспорт в JSON"
            >
              <FileCode size={16} />
            </button>

            <button
              type="button"
              className="icon-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Загрузить из JSON"
            >
              <Upload size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportJson}
            />

            <button
              type="button"
              className="icon-action-btn"
              onClick={handleResetToDefault}
              title="Сбросить к начальному состоянию"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Рабочая область */}
      <main className="main-viewport">
        {activeTab === 'editor' ? (
          <div className="editor-layout">
            <div className="canvas-column">
              <FlowEditor
                quest={quest}
                setQuest={setQuest}
                selectedSceneId={selectedSceneId}
                onSelectScene={setSelectedSceneId}
              />
            </div>
            {selectedScene && (
              <SceneInspector
                scene={selectedScene}
                allScenes={quest.scenes}
                onUpdateScene={handleUpdateScene}
                onDeleteScene={handleDeleteScene}
                onClose={() => setSelectedSceneId(null)}
              />
            )}
          </div>
        ) : (
          <div className="player-wrapper">
            <QuestPlayer quest={quest} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;