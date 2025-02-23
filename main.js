// Элементы интерфейса
const startBtn = document.getElementById('start-btn');
const outputText = document.getElementById('output-text');
const statusText = document.getElementById('status-text');
const speakBtn = document.getElementById('speak-btn');
const clearBtn = document.getElementById('clear-btn');
const languageSelect = document.getElementById('language-select');
const recognitionLanguageSelect = document.getElementById('recognition-language-select');
const pitchRange = document.getElementById('pitch-range');
const rateRange = document.getElementById('rate-range');
const pitchValue = document.getElementById('pitch-value');
const rateValue = document.getElementById('rate-value');

// Переменная для хранения текста
let recognizedText = '';
// Распознавание активно
let isRecognitionActive = false;
// Воспроизведение активно
let isSpeaking = false;

// Инициализация распознавания речи
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = true;
recognition.continuous = true;
recognition.lang = recognitionLanguageSelect.value;

// Обновление текста кнопки распознавания
function updateStartButtonText() {
  const language = recognitionLanguageSelect.value;
  startBtn.textContent = isRecognitionActive
    ? `Выключить распознавание текста (${language})`
    : `Включить распознавание текста (${language})`;
}

// Обновление текста кнопки озвучки
function updateSpeakButtonText() {
  speakBtn.textContent = isSpeaking ? 'Остановить воспроизведение' : 'Озвучить текст';
}

// Обработчик изменения языка распознавания
recognitionLanguageSelect.addEventListener('change', () => {
  const newLanguage = recognitionLanguageSelect.value;

  if (recognition.lang === newLanguage) {
    return;
  }

  if (isRecognitionActive) {
    recognition.stop();
    isRecognitionActive = false;
    updateStartButtonText();
  }

  recognition.lang = newLanguage;
});

// Обработчик начала/остановки распознавания
startBtn.addEventListener('click', () => {
  if (!isRecognitionActive) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        recognition.start();
        isRecognitionActive = true;
        updateStartButtonText();
        statusText.value = 'Распознавание речи начато.';
      })
      .catch((err) => {
        statusText.value = 'Ошибка: Разрешите доступ к микрофону в настройках браузера.';
      });
  } else {
    recognition.stop();
    isRecognitionActive = false;
    updateStartButtonText();
    statusText.value = 'Распознавание речи остановлено.';
  }
});

// Обработчик результатов распознавания
recognition.onresult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }

  outputText.value = recognizedText + ' ' + interimTranscript;

  if (finalTranscript) {
    if (recognizedText && !recognizedText.endsWith(' ')) {
      recognizedText += ' ';
    }
    recognizedText += finalTranscript;
    outputText.value = recognizedText;
  }
};

// Обработчик ошибок распознавания
recognition.onerror = (event) => {
  statusText.value = 'Ошибка: ' + event.error;
};

// Обработчик нажатия на кнопку "Озвучить текст"
speakBtn.addEventListener('click', () => {
  if (isSpeaking) {
    // Если воспроизведение активно, останавливаем его
    window.speechSynthesis.cancel();
    isSpeaking = false;
    updateSpeakButtonText();
    statusText.value = 'Воспроизведение остановлено.';
  } else {
    // Если воспроизведение не активно, начинаем его
    if (recognizedText) {
      const utterThis = new SpeechSynthesisUtterance(recognizedText);

      // Получаем выбранный голос
      const selectedOption = languageSelect.selectedOptions[0].getAttribute('data-name');
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === selectedOption);

      if (selectedVoice) {
        utterThis.voice = selectedVoice;
      }

      // Устанавливаем высоту голоса и скорость речи
      utterThis.pitch = parseFloat(pitchRange.value);
      utterThis.rate = parseFloat(rateRange.value);

      utterThis.lang = languageSelect.value;

      // Обработчик окончания воспроизведения
      utterThis.onend = () => {
        isSpeaking = false;
        updateSpeakButtonText();
        statusText.value = 'Озвучивание завершено.';
      };

      window.speechSynthesis.speak(utterThis);
      isSpeaking = true;
      updateSpeakButtonText();
      statusText.value = 'Озвучивание текста...';
    } else {
      statusText.value = 'Нет текста для озвучки.';
    }
  }
});

// Обработчик изменения голоса озвучки
languageSelect.addEventListener('change', () => {
  if (isSpeaking) {
    // Если воспроизведение активно, останавливаем его
    window.speechSynthesis.cancel();
    isSpeaking = false;
    updateSpeakButtonText();
    statusText.value = 'Воспроизведение остановлено из-за изменения голоса.';
  }
});

// Обработчик изменения значения высоты голоса
pitchRange.addEventListener('input', () => {
  pitchValue.textContent = pitchRange.value;
});

// Обработчик изменения значения скорости речи
rateRange.addEventListener('input', () => {
  rateValue.textContent = rateRange.value;
});

// Обработчик нажатия на кнопку "Очистить текст"
clearBtn.addEventListener('click', () => {
  recognizedText = '';
  outputText.value = '';
  statusText.value = 'Текст очищен.';
});

// Обработчик изменения текста в текстовом поле
outputText.addEventListener('input', () => {
  recognizedText = outputText.value;
});

// Инициализация списка голосов
function populateVoiceList() {
  const voices = window.speechSynthesis.getVoices();

  if (!voices.length) {
    setTimeout(populateVoiceList, 100);
    return;
  }

  languageSelect.innerHTML = '';
  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.lang;
    option.setAttribute('data-name', voice.name);
    languageSelect.appendChild(option);
  });

  const preferredLanguages = ['ru-RU', 'ru_RU'];
  const defaultLanguage = voices.find(voice => preferredLanguages.includes(voice.lang))?.lang || voices[0]?.lang || 'ru_RU';
  languageSelect.value = defaultLanguage;
}

// Обновление списка голосов при изменении
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Первоначальная загрузка голосов
populateVoiceList();