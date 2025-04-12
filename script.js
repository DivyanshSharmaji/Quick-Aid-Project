const emergencyList = document.getElementById("emergencyList");
const detailView = document.getElementById("detailView");
const detailTitle = document.getElementById("detailTitle");
const stepsList = document.getElementById("stepsList");
const speakBtn = document.getElementById("speakBtn");
const backBtn = document.getElementById("backBtn");
const toggleDark = document.getElementById("toggleDark");

let currentSteps = [];

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

      const speakBtn = document.createElement('button');
      speakBtn.textContent = '🔊 Listen';
      speakBtn.className = 'speakBtn';
      speakBtn.addEventListener('click', () => {
        const utterance = new SpeechSynthesisUtterance(item.steps.join('. '));
        speechSynthesis.speak(utterance);
      });

      const callBtn = document.createElement('a');
      callBtn.href = 'tel:112';
      callBtn.className = 'callBtn';
      callBtn.textContent = '📞 Call 112';

      actions.appendChild(speakBtn);
      actions.appendChild(callBtn);

      content.appendChild(stepsList);
      content.appendChild(actions);

      card.appendChild(content);
      emergencyList.appendChild(card);

      card.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');

        // Close all others first
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));

        if (!isOpen) content.classList.add('open');
      });
    });
  });


  function showDetails(item) {
    emergencyList.classList.add('hidden'); // hide list view
  
    detailTitle.textContent = item.title;
    stepsList.innerHTML = '';
    currentSteps = item.steps;
  
    item.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
    });
  
    detailView.classList.remove('hidden');
  }
  
  

backBtn.addEventListener('click', () => {
  detailView.classList.add('hidden');
  emergencyList.classList.remove('hidden');
});

// Dark mode toggle
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Text-to-speech
speakBtn.addEventListener('click', () => {
  const utterance = new SpeechSynthesisUtterance(currentSteps.join('. '));
  speechSynthesis.speak(utterance);
});
