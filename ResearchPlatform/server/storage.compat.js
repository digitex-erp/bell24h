// Simplified storage interface compatible with CommonJS

class MemStorage {
  constructor() {
    this.users = new Map();
    this.alerts = new Map();
    this.industryTrends = new Map();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user) {
    const id = Date.now();
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Alert methods
  async createAlert(alert) {
    const id = Date.now();
    const newAlert = { ...alert, id, createdAt: new Date() };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async getAlerts() {
    return Array.from(this.alerts.values());
  }

  // Industry trends methods
  async getIndustries() {
    return [
      {
        id: 1,
        name: "Electric Vehicles",
        description: "The rapidly growing electric vehicle industry",
        icon: "zap",
        marketSize: "$500B",
        growth: "+24.5% YoY",
        keyCompetitors: ["Tesla", "BYD", "Volkswagen", "Rivian"],
        riskLevel: "medium"
      },
      {
        id: 2,
        name: "Renewable Energy",
        description: "Clean energy solutions including solar, wind and hydroelectric",
        icon: "sun",
        marketSize: "$2.5T",
        growth: "+18.2% YoY",
        keyCompetitors: ["NextEra Energy", "Orsted", "Iberdrola"],
        riskLevel: "low"
      }
    ];
  }
}

// Create and export an instance of the storage
const storage = new MemStorage();

module.exports = { storage };