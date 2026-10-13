import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, RotateCcw, Unlock, HelpCircle } from 'lucide-react';

export function QuestPlayer({ quest }) {
  const [currentSceneId, setCurrentSceneId] = useState(quest.initialSceneId);
  const [inventory, setInventory] = useState([]);
  const [inventoryNames, setInventoryNames] = useState({});
  const [notification, setNotification] = useState(null);

  // Состояние модального окна для ввода пароля
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [inputCode, setInputCode] = useState('');

  const currentScene = quest.scenes[currentSceneId] || Object.values(quest.scenes)[0];

  const showNotification = (text, type = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAction = (action) => {
    if (action.type === 'transition') {
      if (quest.scenes[action.targetSceneId]) {
        setCurrentSceneId(action.targetSceneId);
      }
    } else if (action.type === 'loot') {
      if (inventory.includes(action.itemId)) {
        showNotification('Вы уже забрали этот предмет.', 'warning');
      } else {
        setInventory([...inventory, action.itemId]);
        setInventoryNames({ ...inventoryNames, [action.itemId]: action.itemName || 'Предмет' });
        showNotification(action.successMessage || 'Предмет добавлен в инвентарь!', 'success');
      }
    } else if (action.type === 'conditional_transition') {
      // Если предмет есть в инвентаре (или если требований нет)
      const hasItem = inventory.includes(action.requiredItemId) || inventory.length > 0;
      if (hasItem) {
        showNotification('Замок открыт!', 'success');
        setCurrentSceneId(action.targetSceneId);
      } else {
        showNotification(action.lockedMessage || 'Заперто! Нужен подходящий ключ.', 'error');
      }
    } else if (action.type === 'puzzle') {
      // Открываем окно ввода кода
      setActivePuzzle(action);
      setInputCode('');
    } else if (action.type === 'restart') {
      setInventory([]);
      setInventoryNames({});
      setCurrentSceneId(quest.initialSceneId);
    }
  };

  const handlePuzzleSubmit = (e) => {
    e.preventDefault();
    if (!activePuzzle) return;

    if (inputCode.trim().toLowerCase() === activePuzzle.correctCode.trim().toLowerCase()) {
      showNotification('Код верный! Замок открылся.', 'success');
      const target = activePuzzle.targetSceneId;
      setActivePuzzle(null);
      if (quest.scenes[target]) {
        setCurrentSceneId(target);
      }
    } else {
      showNotification('Неверный код! Попробуйте снова.', 'error');
    }
  };

  return (
    <div className="player-container">
      {/* Шапка */}
      <header className="player-header">
        <h2>{quest.title}</h2>
        <div className="inventory-bar">
          <KeyRound size={18} />
          <span>Инвентарь ({inventory.length}):</span>
          {inventory.length === 0 ? (
            <span className="inventory-empty">Пусто</span>
          ) : (
            inventory.map((itemId) => (
              <span key={itemId} className="inventory-badge">
                {inventoryNames[itemId] || 'Ключ-карта'}
              </span>
            ))
          )}
        </div>
      </header>

      {/* Окно комнаты */}
      <div
        className="scene-screen"
        style={{ backgroundImage: `url(${currentScene?.background})` }}
      >
        <div className="scene-overlay">
          <div className="scene-content">
            <h3>{currentScene?.title}</h3>
            <p>{currentScene?.description}</p>

            {notification && (
              <div className={`notification notif-${notification.type}`}>
                {notification.type === 'success' && <CheckCircle2 size={16} />}
                {notification.type === 'error' && <AlertCircle size={16} />}
                <span>{notification.text}</span>
              </div>
            )}

            <div className="actions-list">
              {currentScene?.actions?.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  className="action-btn"
                  onClick={() => handleAction(act)}
                >
                  {act.type === 'puzzle' && <HelpCircle size={15} />}
                  {act.type === 'conditional_transition' && <Unlock size={15} />}
                  {act.type === 'restart' && <RotateCcw size={15} />}
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно кодового замка */}
      {activePuzzle && (
        <div className="puzzle-modal-backdrop">
          <div className="puzzle-modal">
            <h4>Кодовый замок</h4>
            <p>{activePuzzle.prompt || 'Введите правильную комбинацию:'}</p>
            <form onSubmit={handlePuzzleSubmit}>
              <input
                type="text"
                autoFocus
                placeholder="Введите код..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="puzzle-input"
              />
              <div className="puzzle-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setActivePuzzle(null)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn-confirm">
                  Проверить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}