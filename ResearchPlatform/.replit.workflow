workflows:
  "Start Bell24h":
    env:
      PORT: 3000
    onBoot:
      command: "node run-app-compat.js"
    interpreterType: shell