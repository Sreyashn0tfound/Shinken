CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"answer" varchar(255) NOT NULL,
	"time_spent" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clans" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_score" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"score" integer DEFAULT 0,
	"status" text DEFAULT 'idle',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"section_title" varchar(255),
	"title" varchar(255) NOT NULL,
	"text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"host_id" varchar(255) NOT NULL,
	"pin" varchar(10) NOT NULL,
	"status" varchar(50) DEFAULT 'waiting_in_lobby',
	"mode" varchar(50) DEFAULT 'group',
	"start_time" timestamp,
	"duration" integer DEFAULT 30 NOT NULL,
	"issue_certificates" boolean DEFAULT false NOT NULL,
	"certificate_base64" text,
	CONSTRAINT "sessions_pin_unique" UNIQUE("pin")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clans" ADD CONSTRAINT "clans_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;