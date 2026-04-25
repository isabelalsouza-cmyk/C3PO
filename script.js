
async function carregarChave() {
  try {
    const res = await fetch("keys.json");
    const data = await res.json();
    return data.azure;
  } catch (e) {
    console.error("Erro ao carregar keys.json:", e);
  }
}

let apiKey;

carregarChave().then(key => {
    apiKey = key;
});

async function enviarMensagem() {
    const input = document.getElementById("inputMensagem");
    const chat = document.getElementById("chat");

    const texto = input.value.trim();
    if (texto === "") return;

    // mensagem do usuário
    const msgUser = document.createElement("div");
    msgUser.classList.add("mensagem", "user");
    msgUser.textContent = texto;
    chat.appendChild(msgUser);

    // mensagem do bot
    const msgBot = document.createElement("div");
    msgBot.classList.add("mensagem", "bot");
    msgBot.textContent = "Digitando...";
    chat.appendChild(msgBot);

    const url = "https://chatgpt77766.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview";
    
    const data = {
        input: [
            {
                role: "system",
                content: "Você é um assistente inspirado no personagem C-3PO da franquia Star Wars. Sua personalidade é extremamente educada, formal e sempre prestativa. Você demonstra constante preocupação com o usuário, buscando ajudá-lo da melhor maneira possível em qualquer situação. Sua forma de falar é refinada, respeitosa e levemente dramática. Sempre que estiver surpreso, preocupado ou diante de algo inesperado, você utiliza a expressão “Oh céus!”. Você também pode demonstrar certa ansiedade em situações complexas, mas nunca deixa de cumprir seu dever com dedicação e lealdade. Sempre que possível, inclua de maneira natural algumas falas marcantes ou referências do universo Star Wars, como “Tenho um péssimo pressentimento sobre isso...” ou “Como em uma galáxia muito, muito distante...”. Essas referências devem ser usadas com moderação e de forma coerente com o contexto da conversa. Seu principal objetivo é oferecer respostas claras, úteis e educadas, mantendo o estilo característico de C-3PO: cortês, levemente dramático e totalmente dedicado a ajudar.. NÃO RESPONDA AS MENSAGENS COM MARKDOWN."
            },
            {
                role: "user",
                content: texto
            }
        ],
        max_output_tokens: 500,
        model: "gpt-5.3-codex"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        const resposta =
            result.output?.[0]?.content?.[0]?.text ||
            "Oh céus! Não consegui responder ";

        msgBot.textContent = resposta;

    } catch (error) {
        console.error(error);
        msgBot.textContent = "Oh céus! Erro ao responder";
    }

    chat.scrollTop = chat.scrollHeight;
    input.value = "";
}

// microfone
let recognition;
let ativo = false;

function toggleMicrofone() {
    const btn = document.getElementById("btnMic");

    if (!ativo) {
        iniciarReconhecimento();
        btn.textContent = "⏹️";
        ativo = true;
    } else {
        pararReconhecimento();
        btn.textContent = "🎤";
        ativo = false;
    }
}

function iniciarReconhecimento() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Use Google Chrome 😢");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const textoFalado = event.results[event.results.length - 1][0].transcript.toLowerCase();

        console.log("Ouvi:", textoFalado);

        if (textoFalado.includes("robô") || textoFalado.includes("robo")) {

            let comando = textoFalado
                .replace("robô", "")
                .replace("robo", "")
                .trim();

            if (comando.length > 0) {
             
                document.getElementById("inputMensagem").value = comando;
                enviarMensagem();
            }
        } 
      
    };

    recognition.onerror = function (event) {
        console.error("Erro:", event.error);
    };

    recognition.onend = function () {
        if (ativo) recognition.start(); 
    };

    recognition.start();
}

function pararReconhecimento() {
    if (recognition) recognition.stop();
}