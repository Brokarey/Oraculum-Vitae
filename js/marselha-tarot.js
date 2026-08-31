/**
 * Tarão de Marselha - Sistema Completo
 * Baralho tradicional com 78 cartas
 * Custo: 30 créditos
 */

var DECK_MARSELHA = DECK_NORMAL; // Usa o baralho padrão

function initMarselhaTarot() {
  currentReading = {
    count: 3,
    type: 'Marselha',
    cost: 30,
    selected: [],
    question: '',
    active: false,
    phase: 'all'
  };

  var qEl = document.getElementById('q-3');
  if (qEl) qEl.value = '';

  var resEl = document.getElementById('res-3');
  if (resEl) {
    resEl.style.display = 'none';
    resEl.innerHTML = '';
  }

  var areaEl = document.getElementById('area-3');
  if (areaEl) areaEl.innerHTML = '';

  var consEl = document.getElementById('consultar-3');
  if (consEl) consEl.style.display = 'none';

  showPage('page-tarot-3');
}

function startMarselhaTarot() {
  var q = document.getElementById('q-3').value;
  if (!exigePerguntaValida(q)) return;
  if (!currentUser.isMago && currentUser.credits < 30) {
    return showModal('Créditos Insuficientes', 'Adquira mais créditos para esta consulta.');
  }
  askConfirmQuestion(q.trim(), 'marselha', 3);
}

function proceedMarselhaTarot(q) {
  currentReading.question = q;
  currentReading.selected = [];
  currentReading.active = true;

  if (!currentUser.isMago) {
    currentUser.credits -= 30;
    saveUser(currentUser);
    updateCreditsDisplay();
  }

  document.getElementById('q-3').value = '';
  showChooseBalloon(false);

  var area = document.getElementById('area-3');
  area.innerHTML = '<div id="grid-3" class="cards-grid"></div>';

  renderMarselhaDeck();
}

function renderMarselhaDeck() {
  var pool = shuffle(DECK_MARSELHA);
  var grid = document.getElementById('grid-3');
  grid.innerHTML = '';

  for (var i = 0; i < pool.length; i++) {
    (function(card, idx) {
      var slot = document.createElement('div');
      slot.className = 'card-slot';
      slot.innerHTML = '<div class="card-inner"><div class="card-back"></div><div class="card-front">' + cardImgHTML(card) + '</div></div><div class="card-num">' + (idx + 1) + '</div>';
      slot.onclick = function() {
        selectMarselhCard(this, card);
      };
      grid.appendChild(slot);
    })(pool[i], i);
  }
}

function selectMarselhCard(el, card) {
  if (!currentReading.active || el.classList.contains('flipped')) return;
  if (currentReading.selected.length >= 3) return;

  el.classList.add('flipped');
  currentReading.selected.push(card);

  if (currentReading.selected.length === 3) {
    currentReading.active = false;
    finishMarselhReading();
  }
}

function finishMarselhReading() {
  var res = document.getElementById('res-3');
  var area = document.getElementById('area-3');
  var cards = currentReading.selected;
  var q = currentReading.question;

  area.innerHTML = '<div class="three-cards-display">' +
    '<div class="card-slot flipped"><div class="card-inner"><div class="card-back"></div><div class="card-front">' + cardImgHTML(cards[0]) + '</div></div></div>' +
    '<div class="card-slot flipped"><div class="card-inner"><div class="card-back"></div><div class="card-front">' + cardImgHTML(cards[1]) + '</div></div></div>' +
    '<div class="card-slot flipped"><div class="card-inner"><div class="card-back"></div><div class="card-front">' + cardImgHTML(cards[2]) + '</div></div></div>' +
    '</div>';

  var text = buildMarselhaNarrative(cards, q);
  res.innerHTML = text;
  res.style.display = 'block';

  document.getElementById('consultar-3').style.display = 'flex';

  setTimeout(function() {
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

function buildMarselhaNarrative(cards, q) {
  var c1 = cards[0], c2 = cards[1], c3 = cards[2];

  var h = '<h3>Leitura do Tarão de Marselha</h3>';
  if (q) h += '<p><strong>Sua pergunta:</strong> "' + q + '".</p>';

  h += '<h4>Estrutura da Leitura</h4>';
  h += '<p><strong>Carta 1 (Passado):</strong> ' + c1.n + ' — ' + c1.d + '</p>';
  h += '<p><strong>Interpretação:</strong> ' + c1.cen + '</p>';

  h += '<p><strong>Carta 2 (Presente):</strong> ' + c2.n + ' — ' + c2.d + '</p>';
  h += '<p><strong>Interpretação:</strong> ' + c2.cen + '</p>';

  h += '<p><strong>Carta 3 (Futuro):</strong> ' + c3.n + ' — ' + c3.d + '</p>';
  h += '<p><strong>Interpretação:</strong> ' + c3.cam + '</p>';

  h += '<h4>Conclusão</h4>';
  h += '<p>A jornada de ' + c1.n + ' para ' + c2.n + ' culmina em ' + c3.n + '. Este é o caminho que o Tarão de Marselha revela para você.</p>';

  return h;
}

function voltarTopoMarselha() {
  document.getElementById('res-3').style.display = 'none';
  document.getElementById('res-3').innerHTML = '';
  document.getElementById('area-3').innerHTML = '';
  document.getElementById('consultar-3').style.display = 'none';
  document.getElementById('q-3').value = '';
  window.scrollTo(0, 0);
}