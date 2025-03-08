//prototype ai in web 

function NovaAI(question) {
    const hints = [
      "Hack de servers voor XP!",
      "Zoek de verborgen bestanden...",
      "Probeer het commando 'hack'",
      "Elke hack geeft meer XP...",
      "Nova AI is nog in beta mode..."
    ];
  
    setTimeout(() => {
      print("Nova AI: " + hints[Math.floor(Math.random() * hints.length)]);
    }, 1000);
  }
  