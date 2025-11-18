export const API_BASE_URL = "http://localhost:8080";

export const HAZARD_TYPES = [
  { id: 1, name: "🌊 Tsunami" },
  { id: 2, name: "🌊 High Wave" },
  { id: 3, name: "🛢️ Oil Spill" },
  { id: 4, name: "💧 Flooding" },
];

export const STATUS_COLORS = {
  1: "#ef4444", // not_verified - red
  2: "#22c55e", // official_verified - green
  3: "#3b82f6", // community_verified - blue
  4: "#f97316", // debunked - orange
};

export const STATUS_BADGE_COLORS = {
  1: "bg-red-500",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-orange-500",
};

export const SENTIMENT_COLORS = {
  Positive: "text-green-400",
  Negative: "text-red-400",
  Neutral: "text-gray-400",
};

export const USER_ROLES = {
  CITIZEN: "citizen",
  OFFICIAL: "official",
  ANALYST: "analyst",
};
