import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  index,
  integer,
  real,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "rating",
  "open_text",
  "date",
  "number",
]);

export const surveyStatusEnum = pgEnum("survey_status", [
  "draft",
  "active",
  "closed",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "active",
  "archived",
]);

export const demographicKeyEnum = pgEnum("demographic_key", [
  "gender",
  "age_range",
  "region",
  "profession",
  "csp",
]);

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: campaignStatusEnum("status").default("active").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("campaigns_client_id_idx").on(t.clientId)],
);

export const surveyWaves = pgTable(
  "survey_waves",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    waveNumber: integer("wave_number").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("survey_waves_campaign_id_idx").on(t.campaignId),
    unique("survey_waves_campaign_wave_unique").on(t.campaignId, t.waveNumber),
  ],
);

export const surveys = pgTable(
  "surveys",
  {
    id: text("id").primaryKey(),
    waveId: text("wave_id")
      .notNull()
      .references(() => surveyWaves.id, { onDelete: "cascade" }),
    analystId: text("analyst_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    status: surveyStatusEnum("status").default("draft").notNull(),
    targetResponses: integer("target_responses"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("surveys_wave_id_idx").on(t.waveId),
    index("surveys_analyst_id_idx").on(t.analystId),
    index("surveys_slug_idx").on(t.slug),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(),
    surveyId: text("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    type: questionTypeEnum("type").notNull(),
    order: integer("order").notNull(),
    required: boolean("required").default(true).notNull(),
    config: jsonb("config").$type<QuestionConfig>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("questions_survey_id_idx").on(t.surveyId)],
);

export type QuestionConfig = {
  scaleMin?: number;
  scaleMax?: number;
  labelMin?: string;
  labelMax?: string;
};

export const questionOptions = pgTable(
  "question_options",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    order: integer("order").notNull(),
  },
  (t) => [index("question_options_question_id_idx").on(t.questionId)],
);

export const quotas = pgTable(
  "quotas",
  {
    id: text("id").primaryKey(),
    surveyId: text("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    demographicKey: demographicKeyEnum("demographic_key").notNull(),
    cellLabel: text("cell_label").notNull(),
    targetCount: integer("target_count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("quotas_survey_id_idx").on(t.surveyId)],
);

// Immutable after insert — no updates, no deletes
export const responses = pgTable(
  "responses",
  {
    id: text("id").primaryKey(),
    surveyId: text("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "restrict" }),
    ipHash: text("ip_hash"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (t) => [index("responses_survey_id_idx").on(t.surveyId)],
);

// Immutable after insert
export const answers = pgTable(
  "answers",
  {
    id: text("id").primaryKey(),
    responseId: text("response_id")
      .notNull()
      .references(() => responses.id, { onDelete: "restrict" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    optionId: text("option_id").references(() => questionOptions.id, {
      onDelete: "restrict",
    }),
    valueText: text("value_text"),
    valueNumber: real("value_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("answers_response_id_idx").on(t.responseId),
    index("answers_question_id_idx").on(t.questionId),
  ],
);

export const respondentProfiles = pgTable(
  "respondent_profiles",
  {
    id: text("id").primaryKey(),
    responseId: text("response_id")
      .notNull()
      .unique()
      .references(() => responses.id, { onDelete: "restrict" }),
    gender: text("gender"),
    ageRange: text("age_range"),
    region: text("region"),
    profession: text("profession"),
    csp: text("csp"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// Weights are stored separately — raw responses are never mutated
export const weights = pgTable(
  "weights",
  {
    id: text("id").primaryKey(),
    responseId: text("response_id")
      .notNull()
      .references(() => responses.id, { onDelete: "restrict" }),
    surveyId: text("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "restrict" }),
    weightValue: real("weight_value").notNull(),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  },
  (t) => [
    index("weights_survey_id_idx").on(t.surveyId),
    index("weights_response_id_idx").on(t.responseId),
  ],
);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ---------------------------------------------------------------------------
// Relations — better-auth tables
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  campaigns: many(campaigns),
  surveys: many(surveys),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// ---------------------------------------------------------------------------
// Relations — domain tables
// ---------------------------------------------------------------------------

export const clientsRelations = relations(clients, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  client: one(clients, { fields: [campaigns.clientId], references: [clients.id] }),
  createdBy: one(user, { fields: [campaigns.createdBy], references: [user.id] }),
  waves: many(surveyWaves),
}));

export const surveyWavesRelations = relations(surveyWaves, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [surveyWaves.campaignId], references: [campaigns.id] }),
  surveys: many(surveys),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  wave: one(surveyWaves, { fields: [surveys.waveId], references: [surveyWaves.id] }),
  analyst: one(user, { fields: [surveys.analystId], references: [user.id] }),
  questions: many(questions),
  quotas: many(quotas),
  responses: many(responses),
  weights: many(weights),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  survey: one(surveys, { fields: [questions.surveyId], references: [surveys.id] }),
  options: many(questionOptions),
  answers: many(answers),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] }),
}));

export const quotasRelations = relations(quotas, ({ one }) => ({
  survey: one(surveys, { fields: [quotas.surveyId], references: [surveys.id] }),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  survey: one(surveys, { fields: [responses.surveyId], references: [surveys.id] }),
  answers: many(answers),
  profile: one(respondentProfiles),
  weight: one(weights),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, { fields: [answers.responseId], references: [responses.id] }),
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
  option: one(questionOptions, { fields: [answers.optionId], references: [questionOptions.id] }),
}));

export const respondentProfilesRelations = relations(respondentProfiles, ({ one }) => ({
  response: one(responses, { fields: [respondentProfiles.responseId], references: [responses.id] }),
}));

export const weightsRelations = relations(weights, ({ one }) => ({
  response: one(responses, { fields: [weights.responseId], references: [responses.id] }),
  survey: one(surveys, { fields: [weights.surveyId], references: [surveys.id] }),
}));
