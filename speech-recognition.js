var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();

// Включаем промежуточные результаты
recognition.interimResults = true;
recognition.continuous = true; // Продолжаем слушать даже после паузы
recognition.lang = 'ru-RU'; // Устанавливаем язык распознавания на русский
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');

document.body.onclick = function() {
  recognition.start();
  console.log('Готово к распознаванию речи.');
}

recognition.onresult = function(event) {
  var transcript = '';
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      transcript += event.results[i][0].transcript;
    } else {
      transcript += event.results[i][0].transcript;
    }
  }
  diagnostic.textContent = transcript;
}

recognition.onspeechend = function() {
  // Микрофон не отключается, продолжаем слушать
  console.log('Речь закончилась, но микрофон продолжает слушать.');
}

recognition.onnomatch = function(event) {
  diagnostic.textContent = "Не удалось распознать речь.";
}

recognition.onerror = function(event) {
  diagnostic.textContent = 'Ошибка распознавания: ' + event.error;
}