import { pgTable, serial, varchar, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

// --- THE ARCHIVES: Teacher-created Quizzes ---
export const quizzes = pgTable("quizzes", {
    id: serial("id").primaryKey(),
    teacherId: varchar("teacher_id", { length: 255 }).notNull(), // Clerk User ID
    title: varchar("title", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// --- THE WEAPONS: Individual Questions ---
export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
    sectionTitle: varchar("section_title", { length: 255 }),
    title: varchar("title", { length: 255 }).notNull(),
    text: text("text").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctAnswer: varchar("correct_answer", { length: 255 }).notNull(),
});

// --- THE LIVE ARENA: Active Sessions ---
export const sessions = pgTable("sessions", {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }).notNull(),
    hostId: varchar("host_id", { length: 255 }).notNull(),
    pin: varchar("pin", { length: 10 }).unique().notNull(),
    status: varchar("status", { length: 50 }).default("waiting_in_lobby"),
    mode: varchar("mode", { length: 50 }).default("group"),
    startTime: timestamp("start_time"),
    duration: integer("duration").default(30).notNull(),
    issueCertificates: boolean("issue_certificates").default(false).notNull(),
    certificateBase64: text("certificate_base64"),
});

// --- THE CLANS: Groups of players ---
export const clans = pgTable("clans", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("active"), // 'active', 'eliminated', 'tournament_complete'
    createdAt: timestamp("created_at").defaultNow(),
});

// --- THE COMBATANTS: Players ---
export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }),
    clanId: integer("clan_id").references(() => clans.id, { onDelete: "cascade" }),
    sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }),
    usn: varchar("usn", { length: 255 }),
    role: varchar("role", { length: 50 }).default("student"),
    strikes: integer("strikes").default(0),
    name: text("name").notNull(),
    score: integer("score").default(0),
    status: text("status").default("active"), // 'active', 'eliminated', 'tournament_complete'
    createdAt: timestamp("created_at").defaultNow(),
});

// --- THE IRON VAULT: Answers ---
export const answers = pgTable("answers", {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").references(() => players.id, { onDelete: "cascade" }).notNull(),
    questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }).notNull(),
    sessionId: integer("session_id").references(() => sessions.id, { onDelete: "cascade" }).notNull(),
    answer: varchar("answer", { length: 255 }).notNull(),
    timeSpent: integer("time_spent").notNull(),
});