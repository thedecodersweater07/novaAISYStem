let xp = 0;
const output = document.getElementById("output");
const input = document.getElementById("input");
const commands = {
  "help": "Commands: help, hack, xp, nova, clear",
  "xp": () => `XP: ${xp}`,
  "hack": () => {
    xp += Math.floor(Math.random() * 20) + 10;
    return "** Hack Succesvol ** +XP " + xp;
  },
  "clear": () => {
    output.innerHTML = "";
    return "Console Geleegd!";
  },
  "nova": () => {
    NovaAI("Wat wil je weten?");
    return "Nova AI geactiveerd...";
  }
};

function print(text) {
  output.innerHTML += text + "\n";
  output.scrollTop = output.scrollHeight;
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = input.value.toLowerCase();
    input.value = "";

    if (commands[cmd]) {
      print("> " + cmd);
      setTimeout(() => {
        const result = typeof commands[cmd] === "function" ? commands[cmd]() : commands[cmd];
        print(result);
      }, 500);
    } else {
      print("> " + cmd);
      print("Unknown Command");
    }
  }
});

window.onload = () => {
  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    document.querySelector(".game").classList.remove("hidden");
    print("Welkom bij NOVA AI Terminal v0.1");
    print("Type 'help' voor commands...");
  }, 4000);
};
