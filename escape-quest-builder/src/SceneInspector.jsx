import React, { useState } from 'react';
import {
  X, Trash2, Plus, Key, Lock, Compass, HelpCircle,
  Image as ImageIcon, CheckCircle, Sparkles
} from 'lucide-react';

const PRESET_BACKGROUNDS = [
  { name: 'Лаборатория', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Гермодверь', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Библиотека / Кабинет', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Подвал / Склад', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Свобода / Финал', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80' }
];

export function SceneInspector({ scene, allScenes, onUpdateScene, onDeleteScene, onClose }) {
  const [actionType, setActionType] = useState('transition');
  const [actionLabel, setActionLabel] = useState('');
  const [targetSceneId, setTargetSceneId] = useState('');
  const [itemName, setItemName] = useState('');
  const [puzzleCode, setPuzzleCode] = useState('');

  if (!scene) return null;

  const otherScenes = Object.values(allScenes).filter((s) => s.id !== scene.id);

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!actionLabel.trim()) return;

    let newAction = {
      id: `act_${Date.now()}`,
      label: actionLabel.trim(),
      type: actionType,
    };

    if (actionType === 'transition') {
      if (!targetSceneId) return;
      newAction.targetSceneId = targetSceneId;
    } else if (actionType === 'loot') {
      const itemId = `item_${Date.now()}`;
      newAction.itemId = itemId;
      newAction.itemName = itemName.trim() || 'Секретный предмет';
      newAction.successMessage = `Вы нашли: ${newAction.itemName}!`;
    } else if (actionType === 'conditional_transition') {
      if (!targetSceneId) return;
      newAction.targetSceneId = targetSceneId;
      newAction.requiredItemId = 'item_keycard';
      newAction.lockedMessage = 'Дверь заперта! Нужен ключ или ключ-карта.';
    } else if (actionType === 'puzzle') {
      if (!targetSceneId || !puzzleCode.trim()) return;
      newAction.targetSceneId = targetSceneId;
      newAction.correctCode = puzzleCode.trim();
      newAction.prompt = 'Введите код от замка:';
    }

    const updatedActions = [...(scene.actions || []), newAction];
    onUpdateScene({ ...scene, actions: updatedActions });

    // Сброс формы
    setActionLabel('');
    setPuzzleCode('');
  };

  const handleRemoveAction = (actionId) => {
    const updatedActions = scene.actions.filter((a) => a.id !== actionId);
    onUpdateScene({ ...scene, actions: updatedActions });
  };

  return (
    <aside className="inspector-panel">
      {/* Шапка инспектора */}
      <div className="inspector-header">
        <div>
          <span className="inspector-tag">Свойства сцены</span>
          <h3>{scene.title}</h3>
        </div>
        <button type="button" className="icon-btn-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="inspector-body">
        {/* Базовые поля */}
        <div className="form-group">
          <label>Название комнаты:</label>
          <input
            type="text"
            className="input-field"
            value={scene.title}
            onChange={(e) => onUpdateScene({ ...scene, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Описание для игрока:</label>
          <textarea
            className="textarea-field"
            rows="3"
            value={scene.description}
            onChange={(e) => onUpdateScene({ ...scene, description: e.target.value })}
          />
        </div>

        {/* Фоновые изображения */}
        <div className="form-group">
          <label><ImageIcon size={14} /> Фон локации (пресеты):</label>
          <div className="preset-grid">
            {PRESET_BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                type="button"
                className={`preset-btn ${scene.background === bg.url ? 'preset-btn-active' : ''}`}
                onClick={() => onUpdateScene({ ...scene, background: bg.url })}
              >
                {bg.name}
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        {/* Список текущих действий и загадок */}
        <div className="actions-section">
          <h4>Действия и загадки сцены ({scene.actions?.length || 0})</h4>

          {(!scene.actions || scene.actions.length === 0) ? (
            <p className="hint-empty">Нет действий. Добавьте действие ниже, чтобы комната не была тупиком.</p>
          ) : (
            <ul className="actions-editor-list">
              {scene.actions.map((act) => (
                <li key={act.id} className="action-item-card">
                  <div className="action-item-info">
                    <span className="action-type-badge">
                      {act.type === 'transition' && <Compass size={12} />}
                      {act.type === 'loot' && <Key size={12} />}
                      {act.type === 'conditional_transition' && <Lock size={12} />}
                      {act.type === 'puzzle' && <HelpCircle size={12} />}
                      {act.type === 'transition' && 'Переход'}
                      {act.type === 'loot' && 'Находка'}
                      {act.type === 'conditional_transition' && 'Замок с ключом'}
                      {act.type === 'puzzle' && `Код: ${act.correctCode}`}
                    </span>
                    <strong>{act.label}</strong>
                    {act.targetSceneId && (
                      <span className="action-dest">➔ {allScenes[act.targetSceneId]?.title || act.targetSceneId}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleRemoveAction(act.id)}
                    title="Удалить действие"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Форма добавления нового действия/загадки */}
        <form className="add-action-box" onSubmit={handleAddAction}>
          <h5>+ Добавить загадку / переход</h5>

          <div className="form-group">
            <label>Тип механики:</label>
            <select
              className="select-field"
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="transition">Обычный переход</option>
              <option value="puzzle">Загадка: кодовый замок / пароль</option>
              <option value="loot">Найти предмет (добавить в инвентарь)</option>
              <option value="conditional_transition">Запертая дверь (требует ключ)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Текст на кнопке для игрока:</label>
            <input
              type="text"
              placeholder="Например: Осмотреть сейф / Ввести код"
              className="input-field"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
            />
          </div>

          {actionType === 'loot' && (
            <div className="form-group">
              <label>Название находимого предмета:</label>
              <input
                type="text"
                placeholder="Например: Старинный ключ"
                className="input-field"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
          )}

          {actionType === 'puzzle' && (
            <div className="form-group">
              <label>Правильный ответ / Код:</label>
              <input
                type="text"
                placeholder="Например: 1984 или ПАРОЛЬ"
                className="input-field"
                value={puzzleCode}
                onChange={(e) => setPuzzleCode(e.target.value)}
              />
            </div>
          )}

          {actionType !== 'loot' && (
            <div className="form-group">
              <label>Куда переходим в случае успеха:</label>
              <select
                className="select-field"
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(e.target.value)}
                required
              >
                <option value="">-- Выберите комнату --</option>
                {otherScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="add-action-submit-btn">
            <Plus size={16} /> Добавить в сцену
          </button>
        </form>

        <div className="danger-zone">
          <button
            type="button"
            className="delete-scene-btn"
            onClick={() => onDeleteScene(scene.id)}
          >
            <Trash2 size={16} /> Удалить эту комнату
          </button>
        </div>
      </div>
    </aside>
  );
}