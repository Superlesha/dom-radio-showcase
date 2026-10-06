'use strict';
const details = {
  poster: {kind:'Печать / серия A',asset:'poster.png',description:'Исходный макет A4 — 210 × 297 мм. На пилоте проверим адаптацию к A3, A2, A1 и A0: масштаб текста, дистанцию чтения, вылеты и требования выбранной типографии.',origin:'На экране — растровое превью реального PDF дизайнера. Печатные файлы других размеров здесь не созданы.'},
  square: {kind:'Экран / 1 : 1',asset:'square.png',description:'Квадратный анонс для ленты: название концерта и дата остаются главными. В рабочем продукте размер, состав текста и обязательные знаки задаются профилем площадки.',origin:'Эскиз сгенерирован по исходной афише. Шрифт и состав блоков требуют проверки дизайнером. Это растровый концепт.'},
  story: {kind:'Экран / 9 : 16',asset:'poster.png',description:'Вертикальный экран с местом для названия аккаунта и перехода к событию. Полная исходная афиша помещена в экран без обрезки; это демонстрация размещения, а не самостоятельная адаптация.',origin:'Для пилота нужны отдельная вёрстка 9 : 16, актуальные безопасные поля выбранной площадки и проверка читаемости на телефоне.'},
  banner: {kind:'Экран / 3 : 1',asset:'banner.png',description:'Широкая композиция с акцентом на названии. Подходит для обсуждения горизонтальных анонсов; конкретный размер и набор обязательной информации определим по месту размещения.',origin:'Сгенерированный растровый эскиз. Пример смены композиции, не результат работы будущего движка.'},
  website: {kind:'Цифровая афиша / сайт',asset:'banner.png',description:'Горизонтальный анонс внутри условной страницы события. В комплект можно включить обложку для сайта, которая использует те же данные о концерте.',origin:'Концепт интерфейса с растровым баннером. Не является действующим сайтом Дома Радио.'},
  city: {kind:'Город / наружное размещение',asset:'poster.png',description:'Представление афиши на крупном уличном носителе. В пилоте отдельно проверим читаемость, пропорции и техническое задание оператора размещения.',origin:'Городская среда сгенерирована. Это не фотография фактического размещения или здания Дома Радио. В режиме «Макет» показан исходный постер.'}
};
const cards = [...document.querySelectorAll('.card')];
const filters = [...document.querySelectorAll('.filter')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(other => { const active = other === button; other.classList.toggle('active',active); other.setAttribute('aria-pressed',String(active)); });
  cards.forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
  document.querySelector('#filter-status').textContent = `Показано носителей: ${cards.filter(card => !card.hidden).length}`;
}));
const dialog = document.querySelector('#detail');
const preview = document.querySelector('#detail-preview');
const viewButtons = [...dialog.querySelectorAll('[data-view]')];
let currentCard;
let opener;
function renderDetail(view) {
  const item = details[currentCard.dataset.id];
  preview.replaceChildren();
  if (view === 'context') {
    const scene = currentCard.querySelector('.scene').cloneNode(true);
    scene.querySelectorAll('img').forEach(image => image.loading = 'eager');
    scene.querySelector('.zoom')?.remove();
    preview.append(scene);
  } else {
    const container = document.createElement('div');
    container.className = 'artwork';
    const image = document.createElement('img');
    image.src = `assets/${item.asset}`;
    image.alt = `Макет: ${currentCard.querySelector('h3').textContent}`;
    container.append(image); preview.append(container);
  }
  viewButtons.forEach(button => {const active = button.dataset.view === view; button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
cards.forEach(card => card.querySelector('button').addEventListener('click', event => {
  currentCard = card; opener = event.currentTarget;
  const item = details[card.dataset.id];
  document.querySelector('#detail-title').textContent = card.querySelector('h3').textContent;
  document.querySelector('#detail-kind').textContent = item.kind;
  document.querySelector('#detail-description').textContent = item.description;
  document.querySelector('#detail-origin').textContent = item.origin;
  renderDetail('context'); dialog.showModal(); document.body.style.overflow = 'hidden';
}));
viewButtons.forEach(button => button.addEventListener('click', () => renderDetail(button.dataset.view)));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {if(event.target === dialog){const r = dialog.getBoundingClientRect();if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();}});
dialog.addEventListener('close', () => {document.body.style.overflow = '';opener?.focus();});
