
const emergencyList = document.getElementById("emergencyList");
const detailView = document.getElementById("detailView");
const detailTitle = document.getElementById("detailTitle");
const stepsList = document.getElementById("stepsList");
const speakBtn = document.getElementById("speakBtn");
const toggleDark = document.getElementById("toggleDark");

const searchInput = document.getElementById('searchInput');
const voiceSearchBtn = document.getElementById('voiceSearch');
let cardElements = [];
let currentSteps = [];


const videoMap = {
  "CPR": "https://www.youtube.com/embed/UxEfQJP3MQk", // Learn Hands-Only CPR in 60 seconds
  "Choking": "https://www.youtube.com/embed/KWWcWNpWYUI", // What to do if someone is Choking | One Minute Demos
  "Bleeding": "https://www.youtube.com/embed/V8KiNURVjgk", // Bleeding - Animated
  "Burns": "https://www.youtube.com/embed/DzpRjE5ekVk", // Learn how to treat minor burns in less than 1 minute
  "Fractures": "https://www.youtube.com/embed/CP-vb0xxzFM", // First aid for a broken bone | British Red Cross
  "Snake Bite": "https://www.youtube.com/embed/lLkw4BXa7pQ", // How to treat a snake bite | St John WA
  "Heart Attack": "https://www.youtube.com/embed/gDwt7dD3awc", // First Aid Training - St John Ambulance
  "Stroke": "https://www.youtube.com/embed/7Ee1o05x5kw", // First aid for a stroke - British Red Cross
  "Electric Shock": "https://www.youtube.com/embed/-_45LVWr1PE", // ELECTRIC SHOCK - First Aid In 60 Seconds
  "Drowning": "https://www.youtube.com/embed/Hlrbio-NpxQ", // How to treat drowning on the First Aid Show
  "Seizures": "https://www.youtube.com/embed/1azFuq_yZpE", // #SeizureFirstAid - What to Do in the Event of a Seizure
  "Poisoning": "https://www.youtube.com/embed/b2ieb8BZJuY" // How To Treat Poisoning, Signs & Symptoms - St John Ambulance
};

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Toggle and store theme
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

      // const speakBtn = document.createElement('button');
      // speakBtn.textContent = '🔊 Listen';
      // speakBtn.className = 'speakBtn';
      // speakBtn.addEventListener('click', () => {
      //   const utterance = new SpeechSynthesisUtterance(item.steps.join('. '));
      //   speechSynthesis.speak(utterance);
      // });


      // Helper function to detect selected translation language
      function getTranslatedLangCode() {
        try {
          const lang = document.cookie.match(/googtrans=(\/[^\/]+\/)?([^;]+)/);
          return lang ? lang[2] : 'en';
        } catch (e) {
          return 'en';
        }
      }

      // Toggle text-to-speech logic
      let currentUtterance = null;

      const speakBtn = document.createElement('button');
      speakBtn.textContent = '🔊 Text to Voice ';
      speakBtn.className = 'speakBtn';

      speakBtn.addEventListener('click', () => {
        // If already speaking, cancel it
        if (speechSynthesis.speaking || speechSynthesis.paused) {
          speechSynthesis.cancel();
          speakBtn.classList.remove('speaking');
          return;
        }

        const utterance = new SpeechSynthesisUtterance(item.steps.join('. '));
        utterance.lang = getTranslatedLangCode();
        currentUtterance = utterance;

        // Optional: visual feedback while speaking
        speakBtn.classList.add('speaking');

        speechSynthesis.speak(utterance);

        utterance.onend = () => {
          speakBtn.classList.remove('speaking');
        };

        utterance.onerror = () => {
          speakBtn.classList.remove('speaking');
        };
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
          alert('Geolocation is not supported by your browser.');
          return;
        }

        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const phone = '+916202250417'; // No '+' or country code formatting for WhatsApp links
          const message = `I need help. My location: https://maps.google.com/?q=${latitude},${longitude}`;
          const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(whatsappURL, '_blank');
        }, () => {
          alert('Unable to retrieve your location.');
        });
      });

      actions.appendChild(speakBtn);
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
        // Ignore clicks on buttons inside the card
        if (event.target.closest('button') || event.target.closest('a')) {
          return;
        }
      
        const isOpen = content.classList.contains('open');
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        if (!isOpen) content.classList.add('open');
      });
      
    });
  });




  // Detect selected language from Google Translate
  function getTranslatedLangCode() {
    try {
      const match = document.cookie.match(/googtrans=\/[^\/]+\/([^;]+)/);
      return match ? match[1] : 'en';
    } catch (e) {
      return 'en';
    }
  }
  
  // Translate query to English if needed
  async function translateToEnglish(text) {
    const targetLang = getTranslatedLangCode();
    if (targetLang === 'en') return text;
  
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${targetLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0][0][0]; // translated text
    } catch (err) {
      console.error("Translation error:", err);
      return text; // fallback to original text
    }
  }
  
  // Search handler
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

  // Start listening animation
  voiceSearchBtn.classList.add('listening');

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    searchInput.dispatchEvent(new Event('input'));
  };

  recognition.onerror = () => {
    voiceSearchBtn.classList.remove('listening'); // Remove on error
  };

  recognition.onend = () => {
    voiceSearchBtn.classList.remove('listening'); // Remove on end
  };
});

// Text-to-speech for detail view
speakBtn.addEventListener('click', () => {
  const utterance = new SpeechSynthesisUtterance(currentSteps.join('. '));
  speechSynthesis.speak(utterance);
});
