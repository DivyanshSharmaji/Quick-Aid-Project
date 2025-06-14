// This ensures that the DOM is fully loaded before trying to access elements.
window.addEventListener("DOMContentLoaded", () => {
  // Get references to various DOM elements related to the chatbot.
  const chatToggle = document.getElementById("chatToggle");
  const chatContainer = document.getElementById("chatContainer");
  const chatClose = document.getElementById("chatClose");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");
  const chatMessages = document.getElementById("chatMessages");

  // Array to store chat history for conversational memory
  let chatHistory = [];

  // Function to add a message to the chat history and display it
  function addMessageToChat(role, text) {
    // Add to history for API context
    chatHistory.push({ role: role, parts: [{ text: text }] });

    // Create and append to display
    const msgP = document.createElement("p");
    msgP.textContent = `${role === 'user' ? '👤' : '🤖'}: ${text}`;
    chatMessages.appendChild(msgP);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to latest message
  }

  // Event listener to toggle chatbot visibility when the chatToggle button is clicked.
  chatToggle.addEventListener("click", () => {
    chatContainer.classList.toggle("hidden");
    console.log("Chatbot visibility toggled. Hidden:", chatContainer.classList.contains("hidden"));
  });

  // Event listener to hide the chatbot when the chatClose button is clicked.
  chatClose.addEventListener("click", () => {
    chatContainer.classList.add("hidden");
    console.log("Chatbot close button clicked. Hidden:", chatContainer.classList.contains("hidden"));
  });

  // Event listener for the 'keypress' event on the chat input field.
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      chatSend.click();
    }
  });

  // Event listener for the 'click' event on the chatSend button.
  chatSend.addEventListener("click", async () => {
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;

    addMessageToChat('user', userMsg); // Add user message to history and display
    chatInput.value = ""; // Clear input immediately

    try {
      // Add a system instruction to guide the model for short, simple responses.
      const systemInstruction = "Your responses should be short, simple, and easy to understand. Focus on providing direct answers without excessive detail.";
      
      // Prepare the payload with the entire chat history and system instruction
      const payload = { 
          contents: chatHistory, // Send the full history
          systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      const apiKey = "AIzaSyAqoZ046Jheoz_zoVd61qu9Oo2JsNUbw1A"; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      console.log("Sending API request with payload:", payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log("API response status:", response.status);
      const result = await response.json();
      console.log("Full API result:", result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const botText = result.candidates[0].content.parts[0].text;
        addMessageToChat('model', botText); // Add bot message to history and display
      } else {
        const errP = document.createElement("p");
        if (result.promptFeedback && result.promptFeedback.safetyRatings && result.promptFeedback.safetyRatings.length > 0) {
            errP.textContent = "🤖: Your prompt may have triggered safety filters. Please try rephrasing or a different question.";
            console.warn("Prompt flagged by safety filters:", result.promptFeedback.safetyRatings);
        } else {
            errP.textContent = "🤖: Sorry, I couldn't get a valid response. No candidates were returned.";
        }
        chatMessages.appendChild(errP);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Do NOT add error message to chatHistory to avoid polluting context
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      const errP = document.createElement("p");
      errP.textContent = "🤖: Sorry, I couldn't respond at the moment due to a network issue or an API service problem.";
      chatMessages.appendChild(errP);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      // Do NOT add error message to chatHistory
    }
  });
});


// Emergency list and other existing functionalities below
const emergencyList = document.getElementById("emergencyList");
const detailView = document.getElementById("detailView");
const detailTitle = document.getElementById("detailTitle");
const stepsList = document.getElementById("stepsList");
const speakBtn = document.getElementById("speakBtn");
const toggleDark = document.getElementById("toggleDark");

const searchInput = document.getElementById('searchInput');
const voiceSearchBtn = document.getElementById('voiceSearch');
let cardElements = [];

const videoMap = {
  "CPR": "https://www.youtube.com/embed/UxEfQJP3MQk",
  "Choking": "https://www.youtube.com/embed/KWWcWNpWYUI",
  "Bleeding": "https://www.youtube.com/embed/V8KiNURVjgk",
  "Burns": "https://www.youtube.com/embed/DzpRjE5ekVk",
  "Fractures": "https://www.youtube.com/embed/CP-vb0xxzFM",
  "Snake Bite": "https://www.youtube.com/embed/lLkw4BXa7pQ",
  "Heart Attack": "https://www.youtube.com/embed/gDwt7dD3awc",
  "Stroke": "https://www.youtube.com/embed/7Ee1o05x5kw",
  "Electric Shock": "https://www.youtube.com/embed/-_45LVWr1PE",
  "Drowning": "https://www.youtube.com/embed/Hlrbio-NpxQ",
  "Seizures": "https://www.youtube.com/embed/1azFuq_yZpE",
  "Poisoning": "https://www.youtube.com/embed/b2ieb8BZJuY"
};

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<strong>${item.title}</strong>`;

      const content = document.createElement('div');
      content.className = 'accordion-content';

      const stepsList = document.createElement('ol');
      item.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsList.appendChild(li);
      });

      const actions = document.createElement('div');
      actions.className = 'actions';

      function getTranslatedLangCode() {
        try {
          const lang = document.cookie.match(/googtrans=(\/[^\/]+\/)?([^;]+)/);
          return lang ? lang[2] : 'en';
        } catch (e) {
          return 'en';
        }
      }

      const speakBtnCard = document.createElement('button');
      speakBtnCard.textContent = '🔊 Text to Voice ';
      speakBtnCard.className = 'speakBtn';

      speakBtnCard.addEventListener('click', () => {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
          speechSynthesis.cancel();
          speakBtnCard.classList.remove('speaking');
          return;
        }

        const utterance = new SpeechSynthesisUtterance(item.steps.join('. '));
        utterance.lang = getTranslatedLangCode();

        speakBtnCard.classList.add('speaking');
        speechSynthesis.speak(utterance);

        utterance.onend = () => speakBtnCard.classList.remove('speaking');
        utterance.onerror = () => speakBtnCard.classList.remove('speaking');
      });

      const callBtn = document.createElement('a');
      callBtn.href = 'tel:102';
      callBtn.className = 'callBtn';
      callBtn.textContent = '📞 Call 102';

      const locationBtn = document.createElement('button');
      locationBtn.textContent = '📍 Send Location';
      locationBtn.className = 'locationBtn';
      locationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          console.error('Geolocation is not supported by your browser.');
          return;
        }

        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const phone = '+916202250417';
          const message = `I need help. My location: https://maps.google.com/?q=${latitude},${longitude}`;
          const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappURL, '_blank');
        }, () => {
          console.error('Unable to retrieve your location.');
        });
      });

      actions.appendChild(speakBtnCard);
      actions.appendChild(callBtn);
      actions.appendChild(locationBtn);

      content.appendChild(stepsList);
      content.appendChild(actions);

      if (videoMap[item.title]) {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'videoWrapper';
        videoWrapper.style.marginTop = '2em';
        videoWrapper.innerHTML = `
          <iframe width="100%" height="215" src="${videoMap[item.title]}" 
            frameborder="0" allowfullscreen></iframe>`;
        content.appendChild(videoWrapper);
      }

      card.appendChild(content);
      emergencyList.appendChild(card);

      cardElements.push({ element: card, title: item.title.toLowerCase() });

      card.addEventListener('click', (event) => {
        if (event.target.closest('button') || event.target.closest('a')) return;

        const isOpen = content.classList.contains('open');
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        if (!isOpen) content.classList.add('open');
      });
    });
  });

function getTranslatedLangCode() {
  try {
    const match = document.cookie.match(/googtrans=\/[^\/]+\/([^;]+)/);
    return match ? match[1] : 'en';
  } catch (e) {
    return 'en';
  }
}

async function translateToEnglish(text) {
  const targetLang = getTranslatedLangCode();
  if (targetLang === 'en') return text;

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${targetLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0][0][0];
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}

searchInput.addEventListener('input', async () => {
  const rawQuery = searchInput.value.trim().toLowerCase();
  const translatedQuery = await translateToEnglish(rawQuery);
  cardElements.forEach(({ element, title }) => {
    element.style.display = title.includes(translatedQuery.toLowerCase()) ? '' : 'none';
  });
});

voiceSearchBtn.addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  voiceSearchBtn.classList.add('listening');
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    searchInput.dispatchEvent(new Event('input'));
  };

  recognition.onerror = () => voiceSearchBtn.classList.remove('listening');
  recognition.onend = () => voiceSearchBtn.classList.remove('listening');
});

speakBtn.addEventListener('click', () => {
  const detailSteps = Array.from(stepsList.children).map(li => li.textContent);
  const utterance = new SpeechSynthesisUtterance(detailSteps.join('. '));
  speechSynthesis.speak(utterance);
});
