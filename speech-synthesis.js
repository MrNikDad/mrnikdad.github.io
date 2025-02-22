const synth = window.speechSynthesis;

const outputText = document.getElementById('output-text'); // Текстовое поле для распознанного текста
const speakBtn = document.getElementById('speak-btn'); // Кнопка "Озвучить текст"
const languageSelect = document.getElementById('language-select'); // Выпадающий список языков

let voices = [];

// Функция для заполнения списка голосов
function populateVoiceList() {
  voices = synth.getVoices().sort((a, b) => {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) return -1;
    else if (aname === bname) return 0;
    else return +1;
  });

  // Очищаем список и заполняем его заново
  languageSelect.innerHTML = '';
  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement('option');
    option.textContent = `${voices[i].name} (${voices[i].lang})`;
    option.value = voices[i].lang; // Используем язык как значение
    languageSelect.appendChild(option);
  }
}

// Инициализация списка голосов
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Функция для озвучивания текста
function speak() {
  if (synth.speaking) {
    console.error('Уже озвучивается другой текст.');
    return;
  }

  const textToSpeak = outputText.value; // Получаем текст из текстового поля
  if (textToSpeak !== '') {
    const utterThis = new SpeechSynthesisUtterance(textToSpeak);

    // Устанавливаем язык озвучки
    const selectedLanguage = languageSelect.value;
    utterThis.lang = selectedLanguage;

    // Находим голос, соответствующий выбранному языку
    const selectedVoice = voices.find(voice => voice.lang === selectedLanguage);
    if (selectedVoice) {
      utterThis.voice = selectedVoice;
    }

    utterThis.pitch = 1; // Высота голоса
    utterThis.rate = 1; // Скорость речи

    // Обработчики событий
    utterThis.onend = () => {
      console.log('Озвучивание завершено.');
    };

    utterThis.onerror = (event) => {
      console.error('Ошибка при озвучивании:', event.error);
    };

    synth.speak(utterThis); // Начинаем озвучивание
  } else {
    console.log('Нет текста для озвучки.');
  }
}

// Обработчик для кнопки "Озвучить текст"
speakBtn.addEventListener('click', () => {
  speak();
});