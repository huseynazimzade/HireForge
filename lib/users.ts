import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcryptjs";
import { User, UserRole } from "./types";

// In serverless environments (Vercel, Netlify), cwd is read-only, only /tmp is writable
const isServerless = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "hireforge_data")
  : path.join(process.cwd(), "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory fallback in case filesystem is completely restricted
let memoryUsers: User[] | null = null;

function getDemoUsers(): User[] {
  const defaultPasswordHash = bcrypt.hashSync("Demo1234", 10);
  return [
    {
      id: "demo-hr-id-1",
      fullName: "Demo HR Manager",
      email: "hr@demo.com",
      role: "HR",
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-cand-id-2",
      fullName: "Demo Candidate",
      email: "candidate@demo.com",
      role: "Candidate",
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString(),
    },
  ];
}

// Ensure data folder and users.json exist with seeded demo accounts
function initStorage(): User[] {
  if (memoryUsers && memoryUsers.length > 0) {
    return memoryUsers;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE)) {
      const initialUsers = getDemoUsers();
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), "utf-8");
      } catch {
        // Read-only filesystem fallback
      }
      memoryUsers = initialUsers;
      return initialUsers;
    }

    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    const users: User[] = JSON.parse(raw);
    let updated = false;

    // Verify demo accounts exist
    const hasHR = users.some((u) => u.email.toLowerCase() === "hr@demo.com");
    const hasCand = users.some((u) => u.email.toLowerCase() === "candidate@demo.com");

    const defaultPasswordHash = bcrypt.hashSync("Demo1234", 10);

    if (!hasHR) {
      users.push({
        id: "demo-hr-id-1",
        fullName: "Demo HR Manager",
        email: "hr@demo.com",
        role: "HR",
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
      });
      updated = true;
    }

    if (!hasCand) {
      users.push({
        id: "demo-cand-id-2",
        fullName: "Demo Candidate",
        email: "candidate@demo.com",
        role: "Candidate",
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
      });
      updated = true;
    }

    if (updated) {
      try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
      } catch {
        // Read-only filesystem fallback
      }
    }

    memoryUsers = users;
    return users;
  } catch {
    // If any filesystem error occurs, use in-memory store
    if (!memoryUsers) {
      memoryUsers = getDemoUsers();
    }
    return memoryUsers;
  }
}

export function getAllUsers(): User[] {
  return initStorage();
}

export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function saveUser(newUser: {
  fullName: string;
  email: string;
  role: UserRole;
  passwordPlain: string;
}): User {
  const users = getAllUsers();
  const existing = users.find((u) => u.email.toLowerCase() === newUser.email.trim().toLowerCase());
  if (existing) {
    throw new Error("Email already used");
  }

  const passwordHash = bcrypt.hashSync(newUser.passwordPlain, 10);
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: newUser.fullName.trim(),
    email: newUser.email.trim().toLowerCase(),
    role: newUser.role,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  memoryUsers = users;

  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch {
    // Safely continue with in-memory storage if disk write is disallowed
  }

  return user;
}
