const pianoKeys = document.querySelectorAll(".piano-keys .key");
const volumeSlider = document.querySelector(".volume-slider input");
const keysCheck = document.querySelector(".keys-check input");
const equalizerButtons = document.querySelectorAll(".buttons input[name='equalizer']");

//let audio = new Audio("src/tunes/a.wav");
let mapedKeys = [];
let audio;
let audioContext;
let gainNode;
let equalizer;

// Inicializa o contexto do Web Audio API e cria os nós necessários
const initAudio = () => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioContext.createGain();
  equalizer = audioContext.createBiquadFilter();

  // Conecta os nós do áudio
  gainNode.connect(equalizer);
  equalizer.connect(audioContext.destination);

  updateEqualizer();
};

// Chama a função de inicialização do áudio
initAudio();

// Função para atualizar o equalizador com base na opção selecionada
function updateEqualizer() {
  const selectedEqualizer = document.querySelector(".buttons input[name='equalizer']:checked");

  // Desconectar todos os nós de áudio existentes
  gainNode.disconnect();
  equalizer.disconnect();

  if (selectedEqualizer) {
    if (selectedEqualizer.value === "none") {
      // Conectar diretamente ao destino de áudio
      gainNode.connect(audioContext.destination);
      console.log("Sem filtro");
    } else {
      // Configurar o equalizador conforme a opção selecionada
      equalizer.type = selectedEqualizer.value;
      gainNode.connect(equalizer);
      equalizer.connect(audioContext.destination);
      console.log(`Equalizador selecionado: ${selectedEqualizer.value}`);
    }
  }
}

// Adiciona um ouvinte de eventos para cada botão de rádio
equalizerButtons.forEach((button) => {
  button.addEventListener("change", updateEqualizer);
});

const playTune = (key) => {
  if (audio) {
    audio.pause();
    audio = null;
  }

  // Carrega o áudio usando o Web Audio API
  fetch(`src/tunes/${key}.wav`)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data))
    .then((buffer) => {
      // Cria uma nova instância de AudioBufferSourceNode para cada reprodução
      const audioBufferSource = audioContext.createBufferSource();
      audioBufferSource.buffer = buffer;
      audioBufferSource.connect(gainNode);
      audioBufferSource.start(0);
    })
    .catch((error) => console.error(error));

  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  clickedKey.classList.add("active");
  setTimeout(() => {
    clickedKey.classList.remove("active");
  }, 150);
};

/*
const playTune = (key) => {
  audio.src = `src/tunes/${key}.wav`;
  audio.play();

  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  clickedKey.classList.add("active");
  setTimeout(() => {
    clickedKey.classList.remove("active");
  }, 150);
};
*/

pianoKeys.forEach((key) => {
  key.addEventListener("click", () => playTune(key.dataset.key));
  mapedKeys.push(key.dataset.key);
});

document.addEventListener("keydown", (e) => {
  if (mapedKeys.includes(e.key)) {
    playTune(e.key);
  }
});

const handleVolume = (e) => {
  //audio.volume = e.target.value;
  gainNode.gain.value = e.target.value;
};

const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

volumeSlider.addEventListener("input", handleVolume);

keysCheck.addEventListener("click", showHideKeys);
