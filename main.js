// Элементы интерфейса
const startBtn = document.getElementById('start-btn');
const outputText = document.getElementById('output-text');
const statusText = document.getElementById('status-text');
const speakBtn = document.getElementById('speak-btn');
const clearBtn = document.getElementById('clear-btn');
const languageSelect = document.getElementById('language-select');

// Переменная для хранения распознанного текста
let recognizedText = '';

// Инициализация распознавания речи
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = true;
recognition.continuous = true;
//recognition.lang = 'ru-RU'; // По умолчанию русский язык
recognition.lang = 'en-US'; // Временно измените язык

// Обработчик начала распознавания
startBtn.addEventListener('click', () => {
  // Запрашиваем разрешение на использование микрофона
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => {
      recognition.start();
      statusText.value = 'Распознавание речи начато.';
    })
    .catch((err) => {
      statusText.value = 'Ошибка: Разрешите доступ к микрофону в настройках браузера.';
    });
});

recognition.onresult = (event) => {
    let interimTranscript = ''; // Для промежуточных результатов
    let finalTranscript = ''; // Для финальных результатов
  
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
  
    // Отображаем промежуточные результаты в текстовом поле
    outputText.value = recognizedText + ' ' + interimTranscript;
  
    // Если есть финальный результат, добавляем его в recognizedText
    if (finalTranscript) {
      if (recognizedText && !recognizedText.endsWith(' ')) {
        recognizedText += ' ';
      }
      recognizedText += finalTranscript;
      outputText.value = recognizedText; // Обновляем текстовое поле
    }
};

// Обработчик ошибок распознавания
recognition.onerror = (event) => {
  statusText.value = 'Ошибка: ' + event.error;
};

// Обработчик окончания речи
recognition.onspeechend = () => {
  statusText.value = 'Речь закончилась, но микрофон продолжает слушать.';
};

// Инициализация списка голосов
function populateVoiceList() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    // Если голоса не загружены, попробуем снова через короткое время
    setTimeout(populateVoiceList, 100);
    return;
  }

  // Очищаем список языков
  languageSelect.innerHTML = '';

  // Добавляем голоса в выпадающий список
  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.lang;
    option.setAttribute('data-name', voice.name); // Сохраняем имя голоса
    languageSelect.appendChild(option);
  });

  // Устанавливаем язык озвучки по умолчанию (предпочтительный язык или первый доступный или русский)
  const preferredLanguages = ['ru-RU', 'ru_RU'];
  const defaultLanguage = voices.find(voice => preferredLanguages.includes(voice.lang))?.lang || voices[0]?.lang || 'ru-RU';
  languageSelect.value = defaultLanguage;
}

// Обработчик нажатия на кнопку "Озвучить текст"
speakBtn.addEventListener('click', () => {
  if (recognizedText) {
    const utterThis = new SpeechSynthesisUtterance(recognizedText);

    // Получаем выбранный голос
    const selectedOption = languageSelect.selectedOptions[0].getAttribute('data-name');
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === selectedOption);

    if (selectedVoice) {
      utterThis.voice = selectedVoice; // Устанавливаем голос
    }

    utterThis.lang = languageSelect.value; // Устанавливаем язык
    utterThis.pitch = 1; // Высота голоса
    utterThis.rate = 1; // Скорость речи
    window.speechSynthesis.speak(utterThis);
    statusText.value = 'Озвучивание текста...';
  } else {
    statusText.value = 'Нет текста для озвучки.';
  }
});

// Обработчик нажатия на кнопку "Очистить текст"
clearBtn.addEventListener('click', () => {
  recognizedText = ''; // Очищаем переменную
  outputText.value = ''; // Очищаем текстовое поле
  statusText.value = 'Текст очищен.';
});

// Обновление списка голосов при изменении
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Первоначальная загрузка голосов
populateVoiceList();