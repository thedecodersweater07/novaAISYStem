const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// Functie om berichten te sturen
function sendMessage() {
    let userText = userInput.value.trim();
    if (userText === "") return;  // Controleer of het bericht leeg is

    appendMessage("Jij", userText);
    userInput.value = "";  // Maak het invoerveld leeg

    // Toon "Aan het typen..." indicator
    showTypingIndicator();

    // Simuleer vertraging voor natuurlijker gesprek (bot reageert na 800ms)
    setTimeout(() => {
        removeTypingIndicator();  // Verwijder de typindicator
        let botResponse = getBotResponse(userText);  // Verkrijg de bot-respons
        appendMessage("AI", botResponse);  // Toon de respons
    }, 800);
}

// Toont de "AI is aan het typen..." indicator
function showTypingIndicator() {
    // Voeg de "Typ indicator" toe
    let typingElement = document.createElement("p");
    typingElement.id = "typing-indicator";
    typingElement.innerHTML = "<em>AI is aan het typen...</em>";
    chatBox.appendChild(typingElement);
    chatBox.scrollTop = chatBox.scrollHeight;  // Scroll automatisch naar beneden
}

// Verwijdert de "AI is aan het typen..." indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Functie om de berichten aan de chatbox toe te voegen
function appendMessage(sender, text) {
    let messageElement = document.createElement("p");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;  // Scroll naar beneden bij een nieuw bericht
}

// Geavanceerde intentieherkenningsfunctie
function detectIntent(input) {
    // Normaliseer de input
    const normalizedInput = input.toLowerCase().trim();
    
    // Definieer intentie-patronen met bijbehorende scores
    const intentPatterns = [
        {intent: "greeting", patterns: ["hallo", "hey", "hoi", "goedemorgen", "goedemiddag", "goedenavond", "hi"], threshold: 0.8},
        {intent: "name_introduction", patterns: ["mijn naam is", "ik heet", "ik ben", "noem me"], threshold: 0.8},
        {intent: "wellbeing_inquiry", patterns: ["hoe gaat het", "hoe is het", "alles goed", "hoe voel je", "gaat het goed"], threshold: 0.7},
        {intent: "bot_identity", patterns: ["wat is je naam", "wie ben je", "hoe heet je", "wat ben jij"], threshold: 0.7},
        {intent: "time_inquiry", patterns: ["tijd", "hoe laat", "klok", "uur"], threshold: 0.6},
        {intent: "date_inquiry", patterns: ["welke dag", "datum", "welke maand", "welk jaar"], threshold: 0.6},
        {intent: "calculation", patterns: ["reken", "bereken", "tel", "plus", "min", "keer", "gedeeld door", "+", "-", "*", "/", "vermenigvuldig", "optellen", "aftrekken", "delen"], threshold: 0.6},
        {intent: "translation", patterns: ["vertaal", "vertalen", "in het engels", "in het nederlands", "zeg in het"], threshold: 0.7},
        {intent: "weather", patterns: ["weer", "temperatuur", "regent", "zon", "buiten", "klimaat", "voorspelling"], threshold: 0.6},
        {intent: "definition", patterns: ["wat is", "wie is", "waar is", "wanneer is", "hoe werkt", "leg uit", "verklaar", "betekenis"], threshold: 0.6},
        {intent: "todo_manage", patterns: ["taak", "noteer", "herinner", "onthoud", "to-do", "todo", "lijst", "vergeet niet", "plan"], threshold: 0.7},
        {intent: "gratitude", patterns: ["bedankt", "dank je", "thanks", "dankjewel", "dankuwel", "ik waardeer"], threshold: 0.8},
        {intent: "farewell", patterns: ["doei", "tot ziens", "dag", "bye", "goodbye", "later", "tot morgen"], threshold: 0.8},
        {intent: "help", patterns: ["help", "hulp", "assist", "ondersteuning", "hoe kan ik", "handleiding"], threshold: 0.7},
        {intent: "joke", patterns: ["grap", "mop", "grappig", "lach", "humor", "vertel een grap"], threshold: 0.8},
        {intent: "compliment", patterns: ["goed gedaan", "slim", "knap", "geweldig", "fantastisch", "briljant"], threshold: 0.7}
    ];
    
    // Zoek naar de beste match
    let bestIntent = null;
    let highestScore = 0;
    
    intentPatterns.forEach(intentObj => {
        const score = calculateIntentScore(normalizedInput, intentObj.patterns);
        if (score > highestScore && score >= intentObj.threshold) {
            highestScore = score;
            bestIntent = intentObj.intent;
        }
    });
    
    return bestIntent;
}

// Bereken een score voor hoe goed de input overeenkomt met een intentie
function calculateIntentScore(input, patterns) {
    let maxScore = 0;
    
    patterns.forEach(pattern => {
        // Directe match
        if (input.includes(pattern)) {
            const patternRatio = pattern.length / input.length;
            const score = 0.5 + (patternRatio * 0.5); // Score tussen 0.5 en 1.0 gebaseerd op patroonlengte
            maxScore = Math.max(maxScore, score);
        }
        // Fuzzy matching voor typo's en variaties
        else if (levenshteinDistance(input, pattern) <= 2 && pattern.length > 3) {
            maxScore = Math.max(maxScore, 0.7);
        }
    });
    
    return maxScore;
}

// Levenshtein afstand voor fuzzy matching
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    
    return track[str2.length][str1.length];
}

// Entiteiten herkennen in de tekst
function extractEntities(input) {
    const entities = {
        location: null,
        person: null,
        dateTime: null,
        number: null,
        calculationExpression: null,
        translationText: null,
        todoItem: null,
        searchQuery: null
    };
    
    // Locatie herkennen (met hoofdletter)
    const locationMatch = input.match(/(?:in|voor|bij|te|van|naar)\s+([A-Z][a-zA-Zéèëêç\s-]+)/);
    if (locationMatch) {
        entities.location = locationMatch[1].trim();
    }
    
    // Persoonsnaam herkennen
    const nameMatch = input.match(/(?:mijn naam is|ik heet|ik ben|noem me)\s+([A-Za-z]+)/i);
    if (nameMatch) {
        entities.person = nameMatch[1].trim();
    }
    
    // Getallen herkennen
    const numberMatch = input.match(/\b\d+(?:[,.]\d+)?\b/);
    if (numberMatch) {
        entities.number = parseFloat(numberMatch[0].replace(',', '.'));
    }
    
    // Rekensommen herkennen
    const calcRegex = /[-+]?\d+(?:[,.]\d+)?(?:\s*[\+\-\*\/]\s*[-+]?\d+(?:[,.]\d+)?)+/;
    const calcMatch = input.match(calcRegex);
    if (calcMatch) {
        entities.calculationExpression = calcMatch[0].trim();
    }
    
    // Te vertalen tekst herkennen
    if (input.toLowerCase().includes("vertaal")) {
        const translationMatch = input.match(/vertaal\s+["']?(.+?)["']?(?:\s+naar|$)/i);
        if (translationMatch) {
            entities.translationText = translationMatch[1].trim();
        }
    }
    
    // To-do item herkennen
    if (containsAny(input.toLowerCase(), ["noteer", "onthoud", "voeg toe", "taak"])) {
        const todoMatch = input.match(/(?:noteer|onthoud|voeg toe|taak)\s+["']?(.+?)["']?(?:\s+als|$)/i);
        if (todoMatch) {
            entities.todoItem = todoMatch[1].trim();
        }
    }
    
    // Zoekopdracht herkennen
    if (input.toLowerCase().match(/^(wat|wie|waar|wanneer|hoe|waarom)/)) {
        entities.searchQuery = input.trim();
    }
    
    return entities;
}

// Helper functie voor containsAny - was missing in original code
function containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
}

// Helper functie voor getTimeOfDay - was missing in original code
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "ochtend";
    if (hour < 18) return "middag";
    return "avond";
}

// Helper functie voor getGreeting - was missing in original code
function getGreeting(timeOfDay) {
    switch(timeOfDay) {
        case "ochtend": return "Goedemorgen";
        case "middag": return "Goedemiddag";
        case "avond": return "Goedenavond";
        default: return "Hallo";
    }
}

// Helper functie voor getGratitudeResponse - was missing in original code
function getGratitudeResponse() {
    const responses = [
        "Graag gedaan! Waar kan ik je nog meer mee helpen?",
        "Geen probleem! Heb je nog andere vragen?",
        "Tot je dienst! Wat kan ik nog meer voor je doen?",
        "Altijd tot je dienst! Waar kan ik je verder mee helpen?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Helper functie voor getHelpResponse - was missing in original code
function getHelpResponse() {
    return "Ik ben jouw Nederlandse assistent! Ik kan je helpen met:\n" +
           "- Berekeningen (bijvoorbeeld: 'bereken 5 plus 3')\n" +
           "- Vertalingen (bijvoorbeeld: 'vertaal hallo naar Engels')\n" +
           "- Tijd en datum (bijvoorbeeld: 'hoe laat is het?')\n" +
           "- Weer (bijvoorbeeld: 'wat is het weer in Amsterdam?')\n" +
           "- To-do lijst (bijvoorbeeld: 'noteer boodschappen doen')\n" +
           "- Definities en informatie (bijvoorbeeld: 'wat is AI?')\n" +
           "Vraag gerust wat je wilt weten!";
}

// Helper functie voor tellJoke - was missing in original code
function tellJoke() {
    const jokes = [
        "Waarom kunnen robots nooit honger hebben? Ze zijn altijd gevuld met bytes!",
        "Wat is de overeenkomst tussen een slimme AI en een universiteitsstudent? Ze zijn allebei goed in het maken van dingen op het laatste moment!",
        "Hoe noem je iemand die in een chatbot praat als een vriend? Een byte buddy!",
        "Waarom was de computer koud? Hij had zijn Windows open staan!",
        "Wat zei de ene computer tegen de andere? Heb je al je updates gedaan vandaag?"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
}

// Helper functie voor handleUnknownIntent - was missing in original code
function handleUnknownIntent(input) {
    // Eenvoudige fallback antwoorden
    const fallbackResponses = [
        "Sorry, ik begrijp niet helemaal wat je bedoelt. Kun je het anders formuleren?",
        "Dat heb ik niet helemaal begrepen. Kun je het op een andere manier vragen?",
        "Ik ben nog aan het leren. Kun je je vraag op een andere manier stellen?",
        "Hmm, ik weet niet zeker wat je bedoelt. Probeer het eens met andere woorden?",
        "Ik wil je graag helpen, maar ik begrijp je vraag niet helemaal. Kun je het specifieker maken?"
    ];
    
    // Check voor bekende trefwoorden die we toch zouden moeten herkennen
    if (input.toLowerCase().includes("weer") && input.toLowerCase().includes("?")) {
        return getWeatherInfo("Amsterdam");
    }
    
    if (input.toLowerCase().includes("tijd") && input.toLowerCase().includes("?")) {
        return `Het is momenteel ${new Date().toLocaleTimeString('nl-NL')}.`;
    }
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Functie om de AI-respons te genereren
function getBotResponse(input) {
    const originalInput = input;
    
    // Gebruikerscontext initialiseren indien nodig
    if (!window.userContext) {
        window.userContext = {
            name: null,
            lastIntent: null,
            conversationHistory: [],
            weatherLocation: null,
            lastQuestion: null,
            conversationTopics: {}
        };
    }
    
    // Gespreksteller bijhouden
    userContext.conversationHistory.push({
        user: originalInput,
        timestamp: new Date()
    });
    
    // Intentie detecteren
    const intent = detectIntent(input);
    const entities = extractEntities(input);
    
    // Antwoord genereren op basis van intentie
    let response;
    
    switch (intent) {
        case "greeting":
            const timeOfDay = getTimeOfDay();
            response = userContext.name ? 
                `${getGreeting(timeOfDay)} ${userContext.name}! Hoe kan ik je vandaag helpen?` : 
                `${getGreeting(timeOfDay)}! Hoe kan ik je helpen?`;
            break;
            
        case "name_introduction":
            if (entities.person) {
                userContext.name = entities.person.charAt(0).toUpperCase() + entities.person.slice(1);
                response = `Hallo ${userContext.name}! Leuk je te ontmoeten. Hoe kan ik je helpen?`;
            } else {
                response = "Hoe heet je? Ik heb je naam niet goed verstaan.";
            }
            break;
            
        case "wellbeing_inquiry":
            response = "Met mij gaat het goed, dank je! Ik ben hier om je te helpen. Waar kan ik je mee assisteren?";
            break;
            
        case "bot_identity":
            response = "Ik ben DutchBot, je persoonlijke Nederlandse assistent. Ik kan je helpen met berekeningen, vertalingen, informatie, weer, to-do lijsten en meer!";
            break;
            
        case "time_inquiry":
            const now = new Date();
            response = `Het is momenteel ${now.toLocaleTimeString('nl-NL')}.`;
            break;
            
        case "date_inquiry":
            const today = new Date();
            response = `Vandaag is het ${today.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
            break;
            
        case "calculation":
            response = performCalculation(input, entities.calculationExpression);
            break;
            
        case "translation":
            response = translateText(input, entities.translationText);
            break;
            
        case "weather":
            let location = entities.location || userContext.weatherLocation || "Amsterdam";
            userContext.weatherLocation = location;
            response = getWeatherInfo(location);
            break;
            
        case "definition":
            response = provideDefinition(input);
            break;
            
        case "todo_manage":
            response = handleToDo(input, entities.todoItem);
            break;
            
        case "gratitude":
            response = getGratitudeResponse();
            break;
            
        case "farewell":
            response = userContext.name ? 
                `Tot ziens, ${userContext.name}! Fijne dag verder!` : 
                "Tot ziens! Fijne dag verder!";
            break;
            
        case "help":
            response = getHelpResponse();
            break;
            
        case "joke":
            response = tellJoke();
            break;
            
        case "compliment":
            response = "Dank je wel voor het compliment! Ik doe mijn best om je zo goed mogelijk te helpen.";
            break;
            
        default:
            // Als geen specifieke intentie is herkend, probeer context-aware antwoord te geven
            response = handleUnknownIntent(originalInput);
            break;
    }
    
    // Bijhouden van laatste intentie voor context
    userContext.lastIntent = intent;
    
    // Voeg het bot-antwoord toe aan de gespreksgeschiedenis
    userContext.conversationHistory.push({
        bot: response,
        timestamp: new Date()
    });
    
    return response;
}

// Functie voor berekeningen
function performCalculation(input, expression) {
    if (!expression) {
        // Probeer berekening te identificeren uit natuurlijke taal
        input = input.toLowerCase()
                     .replace(/plus/g, '+')
                     .replace(/min/g, '-')
                     .replace(/keer/g, '*')
                     .replace(/gedeeld door/g, '/')
                     .replace(/maal/g, '*')
                     .replace(/vermenigvuldigd met/g, '*')
                     .replace(/vermenigvuldig/g, '*')
                     .replace(/deel/g, '/')
                     .replace(/opgeteld bij/g, '+')
                     .replace(/afgetrokken van/g, '-');
        
        // Verbeterde regex voor rekensommen
        const regex = /[-+]?\d+(?:[.,]\d+)?(?:\s*[\+\-\*\/]\s*[-+]?\d+(?:[.,]\d+)?)+/g;
        const match = input.match(regex);
        
        if (match) {
            expression = match[0];
        }
    }
    
    if (expression) {
        try {
            // Maak expressie veilig voor evaluatie (verwijder spaties, vervang comma door punt)
            let sanitizedExpression = expression.replace(/\s/g, '').replace(/,/g, '.');
            
            // Evalueer de expressie
            let result = eval(sanitizedExpression);
            
            // Format voor mooiere decimale getallen
            if (result % 1 !== 0) {
                result = result.toFixed(2);
            }
            
            return `Het resultaat van ${expression} is ${result}.`;
        } catch (e) {
            return "Er is iets misgegaan met de berekening. Probeer het eens in een ander formaat.";
        }
    } else {
        return "Ik kon geen rekensom herkennen. Probeer bijvoorbeeld '5 plus 3' of '10 gedeeld door 2'.";
    }
}

// Verbeterde vertaalfunctie
function translateText(input, textToTranslate) {
    const translations = {
        // Basistaal
        "hallo": "hello",
        "goedemorgen": "good morning",
        "goedemiddag": "good afternoon",
        "goedenavond": "good evening",
        "tot ziens": "goodbye",
        "dank je": "thank you",
        "ja": "yes",
        "nee": "no",
        "hoe gaat het": "how are you",
        "het gaat goed": "I'm doing well",
        "help": "help",
        "wat is je naam": "what is your name",
        "mijn naam is": "my name is",
        // Uitgebreide woordenschat
        "computer": "computer",
        "telefoon": "phone",
        "boek": "book",
        "auto": "car",
        "fiets": "bicycle",
        "huis": "house",
        "school": "school",
        "werk": "work",
        "eten": "food",
        "drinken": "drink",
        "water": "water",
        "brood": "bread",
        "kaas": "cheese",
        "appel": "apple",
        "banaan": "banana",
        "kat": "cat",
        "hond": "dog",
        "mooi": "beautiful",
        "groot": "big",
        "klein": "small",
        "snel": "fast",
        "langzaam": "slow",
        "vandaag": "today",
        "morgen": "tomorrow",
        "gisteren": "yesterday",
        "tijd": "time",
        "weer": "weather",
        "zon": "sun",
        "maan": "moon",
        "regen": "rain",
        "sneeuw": "snow"
    };

    // Extract de te vertalen tekst als die nog niet is geïdentificeerd
    if (!textToTranslate) {
        if (input.includes("vertaal")) {
            const match = input.match(/vertaal\s+["']?(.+?)["']?(?:\s+naar engels|\s+in het engels|$)/i);
            if (match && match[1]) {
                textToTranslate = match[1].trim();
            }
        }
    }

    if (!textToTranslate || textToTranslate.length === 0) {
        return "Wat wil je dat ik vertaal? Probeer bijvoorbeeld 'vertaal hallo naar Engels'.";
    }

    // Check voor exacte matches in de volledige zin
    if (translations[textToTranslate.toLowerCase()]) {
        return `"${textToTranslate}" in het Engels is "${translations[textToTranslate.toLowerCase()]}"`;
    }

    // Woord-voor-woord vertaling met woordgroepherkenning
    const words = textToTranslate.toLowerCase().split(/\s+/);
    let translatedText = [];
    
    // Probeer eerst woordgroepen van 3, dan 2 woorden te matchen
    for (let i = 0; i < words.length; i++) {
        // Probeer driewoordige uitdrukkingen
        if (i < words.length - 2) {
            const threeWordPhrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
            if (translations[threeWordPhrase]) {
                translatedText.push(translations[threeWordPhrase]);
                i += 2;
                continue;
            }
        }
        
        // Probeer tweewoordige uitdrukkingen
        if (i < words.length - 1) {
            const twoWordPhrase = `${words[i]} ${words[i+1]}`;
            if (translations[twoWordPhrase]) {
                translatedText.push(translations[twoWordPhrase]);
                i += 1;
                continue;
            }
        }
        
        // Vertaal individuele woorden
        translatedText.push(translations[words[i]] || words[i]);
    }
    
    // Controleer of er daadwerkelijk iets is vertaald
    if (translatedText.some((word, index) => word !== words[index])) {
        return `"${textToTranslate}" in het Engels is ongeveer: "${translatedText.join(' ')}"`;
    } else {
        return `Ik ken de vertaling voor "${textToTranslate}" niet volledig. Ik kan alleen basiswoorden en -zinnen vertalen.`;
    }
}

// Functie om gesimuleerde weerinformatie te geven met meer variatie
function getWeatherInfo(location) {
    // Uitgebreide gesimuleerde weergegevens
    const weatherTypes = [
        {condition: "zonnig", tempRange: [20, 28], extraInfo: ["Met een lichte bries", "Perfect weer om buiten te zijn", "Vergeet je zonnebrand niet!"]},
        {condition: "bewolkt", tempRange: [15, 22], extraInfo: ["Met af en toe zon", "Vrij aangenaam", "Perfect weer voor een wandeling"]},
        {condition: "licht bewolkt", tempRange: [17, 25], extraInfo: ["Met veel zonnige perioden", "Aangenaam weer", "Prima dag voor buitenactiviteiten"]},
        {condition: "regenachtig", tempRange: [10, 18], extraInfo: ["Neem een paraplu mee", "Verwachte neerslag: 5mm", "Het klaart later misschien op"]},
        {condition: "buiig", tempRange: [12, 20], extraInfo: ["Met kans op onweer", "Afwisselend droog en nat", "Wees voorbereid op plotselinge buien"]},
        {condition: "winderig", tempRange: [14, 21], extraInfo: ["Windkracht 6", "Frisse wind uit het westen", "Pas op met losse voorwerpen"]},
        {condition: "mistig", tempRange: [8, 15], extraInfo: ["Beperkt zicht", "Wees voorzichtig in het verkeer", "De mist trekt later op"]},
        {condition: "stormachtig", tempRange: [10, 16], extraInfo: ["Met zware windstoten", "Blijf bij voorkeur binnen", "Waarschuwing voor vallende takken"]},
        {condition: "sneeuwachtig", tempRange: [-5, 3], extraInfo: ["Lichte sneeuwval verwacht", "Pas op voor gladheid", "Sneeuwpret in aantocht!"]}
    ];
    
    const dayParts = ["vanochtend", "vanmiddag", "vanavond", "vannacht"];
    const dayPart = dayParts[Math.floor(Math.random() * dayParts.length)];
    
    // Kies een willekeurig weertype
    const weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const condition = weatherType.condition;
    const minTemp = weatherType.tempRange[0];
    const maxTemp = weatherType.tempRange[1];
    const temperature = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    const extraInfo = weatherType.extraInfo[Math.floor(Math.random() * weatherType.extraInfo.length)];
    
    return `Het weer in ${location} is ${dayPart} ${condition} met een temperatuur van ${temperature}°C. ${extraInfo}`;
}

// Functie voor definities en algemene informatie
function provideDefinition(input) {
    const definitions = {
        "wat is een computer": "Een computer is een elektronisch apparaat dat gegevens kan verwerken volgens een reeks instructies.",
        "wat is het internet": "Het internet is een wereldwijd netwerk van computers die met elkaar verbonden zijn en informatie uitwisselen.",
        "wat is nederland": "Nederland is een land in West-Europa bekend om zijn vlakke landschap, kanalen, tulpenvelden, windmolens en fietspaden.",
        "wat is amsterdam": "Amsterdam is de hoofdstad van Nederland, bekend om zijn artistieke erfgoed, uitgebreide grachtennetwerk en smalle huizen met puntgevels.",
        "wie is de koning van nederland": "Willem-Alexander is de koning van Nederland sinds 30 april 2013.",
        "wat is ai": "AI (Artificiële Intelligentie) is het vermogen van een computer of robot om taken uit te voeren die normaal menselijke intelligentie vereisen.",
        "wat is machine learning": "Machine learning is een onderdeel van AI waarbij systemen automatisch leren en verbeteren van ervaringen zonder expliciet geprogrammeerd te zijn.",
        "wat is een smartphone": "Een smartphone is een mobiele telefoon met uitgebreide computerfuncties, internetverbinding en een besturingssysteem dat apps kan draaien.",
        "wat is een algoritme": "Een algoritme is een stapsgewijze procedure of formule voor het oplossen van een probleem, vaak gebruikt in computationele processen.",
        "wat is programmeren": "Programmeren is het proces van het schrijven van instructies (code) die een computer kan uitvoeren om bepaalde taken te verrichten.",
        "wat is een database": "Een database is een georganiseerde verzameling van gestructureerde gegevens die elektronisch is opgeslagen in een computersysteem.",
        "wat is een website": "Een website is een verzameling gerelateerde webpagina's die toegankelijk zijn via het internet en meestal een gemeenschappelijk domein hebben.",
        "wat is een browser": "Een browser is een softwareapplicatie waarmee gebruikers toegang hebben tot het World Wide Web en webpagina's kunnen bekijken.",
        "wat is de eu": "De EU (Europese Unie) is een politieke en economische unie van momenteel 27 lidstaten die zich voornamelijk in Europa bevinden.",
        "wat is de hoofdstad van": "Om je te helpen met de hoofdstad, kun je specificeren van welk land je de hoofdstad wilt weten?"
    };
    
    const dayParts = ["vanochtend", "vanmiddag", "vanavond", "vannacht"];
    const dayPart = dayParts[Math.floor(Math.random() * dayParts.length)];
    
    // Kies een willekeurig weertype
    const weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const condition = weatherType.condition;
    const minTemp = weatherType.tempRange[0];
    const maxTemp = weatherType.tempRange[1];
    const temperature = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    const extraInfo = weatherType.extraInfo[Math.floor(Math.random() * weatherType.extraInfo.length)];
    
    return `Het weer in ${location} is ${dayPart} ${condition} met een temperatuur van ${temperature}°C. ${extraInfo}`;
}

// Functie voor definities en algemene informatie
function provideDefinition(input) {
    const definitions = {
        "wat is een computer": "Een computer is een elektronisch apparaat dat gegevens kan verwerken volgens een reeks instructies.",
        "wat is het internet": "Het internet is een wereldwijd netwerk van computers die met elkaar verbonden zijn en informatie uitwisselen.",
        "wat is nederland": "Nederland is een land in West-Europa bekend om zijn vlakke landschap, kanalen, tulpenvelden, windmolens en fietspaden.",
        "wat is amsterdam": "Amsterdam is de hoofdstad van Nederland, bekend om zijn artistieke erfgoed, uitgebreide grachtennetwerk en smalle huizen met puntgevels.",
        "wie is de koning van nederland": "Willem-Alexander is de koning van Nederland sinds 30 april 2013.",
        "wat is ai": "AI (Artificiële Intelligentie) is het vermogen van een computer of robot om taken uit te voeren die normaal menselijke intelligentie vereisen.",
        "wat is machine learning": "Machine learning is een onderdeel van AI waarbij systemen automatisch leren en verbeteren van ervaringen zonder expliciet geprogrammeerd te zijn.",
        "wat is een smartphone": "Een smartphone is een mobiele telefoon met uitgebreide computerfuncties, internetverbinding en een besturingssysteem dat apps kan draaien.",
        "wat is een algoritme": "Een algoritme is een stapsgewijze procedure of formule voor het oplossen van een probleem, vaak gebruikt in computationele processen.",
        "wat is programmeren": "Programmeren is het proces van het schrijven van instructies (code) die een computer kan uitvoeren om bepaalde taken te verrichten.",
        "wat is een database": "Een database is een georganiseerde verzameling van gestructureerde gegevens die elektronisch is opgeslagen in een computersysteem.",
        "wat is een website": "Een website is een verzameling gerelateerde webpagina's die toegankelijk zijn via het internet en meestal een gemeenschappelijk domein hebben.",
        "wat is een browser": "Een browser is een softwareapplicatie waarmee gebruikers toegang hebben tot het World Wide Web en webpagina's kunnen bekijken.",
        "wat is de eu": "De EU (Europese Unie) is een politieke en economische unie van momenteel 27 lidstaten die zich voornamelijk in Europa bevinden.",
        "wat is de hoofdstad van": "Om je te helpen met de hoofdstad, kun je specificeren van welk land je de hoofdstad wilt weten?"
    };
    
    // Normaliseer de input voor betere matching
    const normalizedInput = input.toLowerCase().trim();
    
    // Check voor exacte matches
    if (definitions[normalizedInput]) {
        return definitions[normalizedInput];
    }
    
    // Check voor gedeeltelijke matches
    for (const [question, answer] of Object.entries(definitions)) {
        if (normalizedInput.includes(question)) {
            return answer;
        }
    }
    
    // Hoofdstad matching
    if (normalizedInput.includes("wat is de hoofdstad van")) {
        const countries = {
            "nederland": "Amsterdam is de hoofdstad van Nederland.",
            "belgië": "Brussel is de hoofdstad van België.",
            "duitsland": "Berlijn is de hoofdstad van Duitsland.",
            "frankrijk": "Parijs is de hoofdstad van Frankrijk.",
            "spanje": "Madrid is de hoofdstad van Spanje.",
            "italië": "Rome is de hoofdstad van Italië.",
            "verenigd koninkrijk": "Londen is de hoofdstad van het Verenigd Koninkrijk.",
            "portugal": "Lissabon is de hoofdstad van Portugal.",
            "griekenland": "Athene is de hoofdstad van Griekenland.",
            "zweden": "Stockholm is de hoofdstad van Zweden.",
            "noorwegen": "Oslo is de hoofdstad van Noorwegen.",
            "denemarken": "Kopenhagen is de hoofdstad van Denemarken.",
            "finland": "Helsinki is de hoofdstad van Finland."
        };
        
        for (const [country, capital] of Object.entries(countries)) {
            if (normalizedInput.includes(country)) {
                return capital;
            }
        }
        
        return "Om je te helpen met de hoofdstad, kun je specificeren van welk land je de hoofdstad wilt weten?";
    }
    
    return "Ik heb geen specifieke informatie over die vraag. Kun je specifieker zijn of een andere vraag stellen?";
}

// Functie voor to-do lijstbeheer
function handleToDo(input, todoItem) {
    if (!window.todoList) {
        window.todoList = [];
    }
    
    if (containsAny(input.toLowerCase(), ["toon", "bekijk", "lijst", "wat zijn mijn taken"])) {
        if (window.todoList.length === 0) {
            return "Je hebt nog geen taken in je lijst.";
        }
        
        let response = "Hier zijn je taken:\n";
        window.todoList.forEach((task, index) => {
            response += `${index + 1}. ${task}\n`;
        });
        return response;
    }
    
    if (containsAny(input.toLowerCase(), ["voeg toe", "noteer", "onthoud", "nieuwe taak"])) {
        if (todoItem) {
            window.todoList.push(todoItem);
            return `"${todoItem}" is toegevoegd aan je takenlijst.`;
        } else {
            const taskRegex = /(voeg toe|noteer|onthoud|nieuwe taak)\s+["']?(.+?)["']?(?:\s+als|\s+in|\s+op|$)/i;
            const match = input.match(taskRegex);
            
            if (match && match[2]) {
                const task = match[2].trim();
                window.todoList.push(task);
                return `"${task}" is toegevoegd aan je takenlijst.`;
            }
        }
    }
    
    if (containsAny(input.toLowerCase(), ["verwijder", "haal weg", "delete", "wis"])) {
        const numberRegex = /\d+/;
        const match = input.match(numberRegex);
        
        if (match) {
            const index = parseInt(match[0]) - 1;
            if (index >= 0 && index < window.todoList.length) {
                const removedTask = window.todoList.splice(index, 1)[0];
                return `"${removedTask}" is verwijderd van je takenlijst.`;
            }
        } else if (input.toLowerCase().includes("alles") || input.toLowerCase().includes("alle taken")) {
            const taskCount = window.todoList.length;
            window.todoList = [];
            return `Alle ${taskCount} taken zijn verwijderd uit je lijst.`;
        }
    }
    
    if (input.toLowerCase().includes("hoeveel") && containsAny(input.toLowerCase(), ["taken", "todo", "to-do", "to do"])) {
        return `Je hebt momenteel ${window.todoList.length} ${window.todoList.length === 1 ? 'taak' : 'taken'} in je lijst.`;
    }
    
    return "Je kunt taken bekijken met 'toon taken', toevoegen met 'noteer [taak]', of verwijderen met 'verwijder taak 1'.";
}
