export const initialQuest = {
  title: "Побег из заброшенной лаборатории",
  initialSceneId: "scene_1",
  scenes: {
    scene_1: {
      id: "scene_1",
      title: "Кабинет профессора",
      description: "Вы очнулись в полутемной комнате. На стене висит электрощиток, а впереди массивная железная дверь.",
      background: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      actions: [
        {
          id: "act_search_desk",
          type: "loot",
          label: "Осмотреть ящик стола",
          itemId: "item_keycard",
          itemName: "Магнитная карта доступа",
          successMessage: "В ящике стола вы нашли магнитную карту доступа!",
        },
        {
          id: "act_goto_door",
          type: "transition",
          label: "Подойти к железной двери",
          targetSceneId: "scene_2",
        }
      ]
    },
    scene_2: {
      id: "scene_2",
      title: "Герметичная дверь",
      description: "Тяжелая дверь со сканером карт. Индикатор горит красным цветом.",
      background: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
      actions: [
        {
          id: "act_unlock_door",
          type: "conditional_transition",
          label: "Приложить карту к сканеру",
          requiredItemId: "item_keycard",
          targetSceneId: "scene_win",
          lockedMessage: "Сканер издает протяжный писк. Нужна карта доступа!",
        },
        {
          id: "act_back",
          type: "transition",
          label: "Вернуться в кабинет",
          targetSceneId: "scene_1",
        }
      ]
    },
    scene_win: {
      id: "scene_win",
      title: "Свобода!",
      description: "Замок щелкает, гермодверь распахивается, и вы выходите на свежий воздух. Квест успешно пройден!",
      background: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      actions: [
        {
          id: "act_restart",
          type: "restart",
          label: "Пройти заново",
        }
      ]
    }
  }
};