// function toggleCustomSizeForm() {
//     const form = document.getElementById('custom-size-form');
//     form.style.display = form.style.display === 'none' ? 'block' : 'none';
//   }
  
async function shouldShowForm() {
  try {
    // Пытаемся получить настройки из разных возможных путей
    // Используем динамический URL
    let appUrl = window.location.hostname === 'localhost' ? 'http://localhost:64295' : window.location.origin;
    let res = await fetch(`${appUrl}/api/custom-size`);
    
    if (!res.ok) {
      // Если первый путь не работает, пробуем альтернативные
      res = await fetch('/apps/custom-size-app/api/custom-size');
    }
    
    if (!res.ok) {
      res = await fetch('/api/custom-size');
    }
    
    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return false;
    }
    
    const data = await res.json();

    if (!data.enabled) return false;

    // Если приложение включено, показываем форму для всех товаров
    return true;
  } catch (e) {
    console.error('Custom Size API error:', e);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const widget = document.getElementById("custom-size-widget");
  if (!widget) return;

  widget.style.display = "none"; // скрываем по умолчанию

  const shouldShow = await shouldShowForm();
  if (shouldShow) {
    widget.style.display = "block";
  }
});