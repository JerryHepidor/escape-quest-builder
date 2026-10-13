export function exportQuestToHtml(quest) {
  const questDataJson = JSON.stringify(quest, null, 2);

  const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quest.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0b0f19; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .player-container { width: 100%; max-width: 860px; background: #111827; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 1px solid #1f2937; position: relative; }
    .player-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #0b0f19; border-bottom: 1px solid #1f2937; }
    .player-header h2 { font-size: 1.15rem; font-weight: 700; color: #38bdf8; }
    .inventory-bar { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #94a3b8; }
    .inventory-badge { background: #0284c7; color: white; padding: 3px 9px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
    .scene-screen { position: relative; height: 500px; background-size: cover; background-position: center; display: flex; align-items: flex-end; transition: background-image 0.3s ease; }
    .scene-overlay { width: 100%; background: linear-gradient(to top, rgba(11, 15, 25, 0.98) 45%, rgba(11, 15, 25, 0.3) 100%); padding: 28px; }
    .scene-content h3 { font-size: 1.6rem; margin-bottom: 10px; color: #f8fafc; }
    .scene-content p { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 20px; }
    .actions-list { display: flex; flex-wrap: wrap; gap: 12px; }
    .action-btn { background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); }
    .action-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
    .notification { padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px; display: none; }
    .notif-success { background: #064e3b; color: #6ee7b7; border: 1px solid #047857; }
    .notif-error { background: #7f1d1d; color: #fca5a5; border: 1px solid #b91c1c; }
    .puzzle-modal { display: none; position: absolute; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 50; }
    .puzzle-box { background: #1e293b; border: 1px solid #38bdf8; border-radius: 12px; padding: 24px; width: 340px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .puzzle-box h4 { font-size: 1.2rem; color: #38bdf8; margin-bottom: 8px; }
    .puzzle-input { width: 100%; background: #0b0f19; border: 1px solid #334155; color: white; padding: 10px; border-radius: 6px; font-size: 1.1rem; text-align: center; margin: 14px 0; outline: none; }
    .puzzle-actions { display: flex; justify-content: flex-end; gap: 8px; }
  </style>
</head>
<body>
  <div class="player-container">
    <header class="player-header">
      <h2 id="quest-title">${quest.title}</h2>
      <div class="inventory-bar" id="inventory-bar">Инвентарь: (пусто)</div>
    </header>

    <div class="scene-screen" id="scene-bg">
      <div class="scene-overlay">
        <div class="scene-content">
          <div id="notification-box" class="notification"></div>
          <h3 id="scene-title"></h3>
          <p id="scene-desc"></p>
          <div class="actions-list" id="actions-list"></div>
        </div>
      </div>
    </div>

    <div class="puzzle-modal" id="puzzle-modal">
      <div class="puzzle-box">
        <h4>Кодовый замок</h4>
        <p id="puzzle-prompt">Введите правильную комбинацию:</p>
        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Введите код...">
        <div class="puzzle-actions">
          <button class="action-btn" style="background:#475569;" onclick="closePuzzle()">Отмена</button>
          <button class="action-btn" onclick="submitPuzzle()">Проверить</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const quest = ${questDataJson};
    let currentSceneId = quest.initialSceneId;
    let inventory = [];
    let currentPuzzleAction = null;

    function showNotification(text, type) {
      const box = document.getElementById('notification-box');
      box.textContent = text;
      box.className = 'notification notif-' + type;
      box.style.display = 'block';
      setTimeout(() => { box.style.display = 'none'; }, 3500);
    }

    function renderScene() {
      const scene = quest.scenes[currentSceneId] || Object.values(quest.scenes)[0];
      document.getElementById('scene-title').textContent = scene.title;
      document.getElementById('scene-desc').textContent = scene.description;
      document.getElementById('scene-bg').style.backgroundImage = 'url(' + scene.background + ')';

      const invBar = document.getElementById('inventory-bar');
      if (inventory.length === 0) {
        invBar.innerHTML = 'Инвентарь: <i>(пусто)</i>';
      } else {
        invBar.innerHTML = 'Инвентарь: ' + inventory.map(item => '<span class="inventory-badge">' + item + '</span>').join(' ');
      }

      const actionsContainer = document.getElementById('actions-list');
      actionsContainer.innerHTML = '';

      (scene.actions || []).forEach(act => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = act.label;
        btn.onclick = () => handleAction(act);
        actionsContainer.appendChild(btn);
      });
    }

    function handleAction(act) {
      if (act.type === 'transition') {
        currentSceneId = act.targetSceneId;
        renderScene();
      } else if (act.type === 'loot') {
        const name = act.itemName || 'Предмет';
        if (inventory.includes(name)) {
          showNotification('Вы уже взяли этот предмет.', 'error');
        } else {
          inventory.push(name);
          showNotification(act.successMessage || 'Предмет добавлен в инвентарь!', 'success');
          renderScene();
        }
      } else if (act.type === 'conditional_transition') {
        if (inventory.length > 0) {
          showNotification('Замок открыт подходящим ключом!', 'success');
          currentSceneId = act.targetSceneId;
          renderScene();
        } else {
          showNotification(act.lockedMessage || 'Заперто! Нужен ключ.', 'error');
        }
      } else if (act.type === 'puzzle') {
        currentPuzzleAction = act;
        document.getElementById('puzzle-prompt').textContent = act.prompt || 'Введите код:';
        document.getElementById('puzzle-input').value = '';
        document.getElementById('puzzle-modal').style.display = 'flex';
        document.getElementById('puzzle-input').focus();
      } else if (act.type === 'restart') {
        inventory = [];
        currentSceneId = quest.initialSceneId;
        renderScene();
      }
    }

    function closePuzzle() {
      document.getElementById('puzzle-modal').style.display = 'none';
      currentPuzzleAction = null;
    }

    function submitPuzzle() {
      const code = document.getElementById('puzzle-input').value.trim();
      if (!currentPuzzleAction) return;

      if (code.toLowerCase() === currentPuzzleAction.correctCode.trim().toLowerCase()) {
        closePuzzle();
        showNotification('Верно! Замок открыт.', 'success');
        currentSceneId = currentPuzzleAction.targetSceneId;
        renderScene();
      } else {
        showNotification('Неверный код!', 'error');
      }
    }

    renderScene();
  </script>
</body>
</html>`;

  // Запуск скачивания готового HTML-файла
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quest.title.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuestToJson(quest) {
  const jsonStr = JSON.stringify(quest, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quest-schema.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}