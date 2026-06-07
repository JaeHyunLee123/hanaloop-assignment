// 데이터베이스 테이블 스키마 및 관계 정의
import { pgTable, text, varchar, doublePrecision, integer, unique, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const countries = pgTable("countries", {
  code: varchar("code", { length: 2 }).primaryKey(),
  name: text("name").notNull(),
});

export const countriesRelations = relations(countries, ({ many }) => ({
  companies: many(companies),
}));

export const companies = pgTable("companies", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  countryCode: varchar("country_code", { length: 2 })
    .notNull()
    .references(() => countries.code, { onDelete: "cascade" }),
});

export const companiesRelations = relations(companies, ({ one, many }) => ({
  country: one(countries, {
    fields: [companies.countryCode],
    references: [countries.code],
  }),
  emissions: many(emissions),
  posts: many(posts),
}));

export const emissions = pgTable(
  "emissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: varchar("company_id", { length: 50 })
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    yearMonth: varchar("year_month", { length: 7 }).notNull(),
    source: text("source").notNull(),
    emissions: doublePrecision("emissions").notNull(),
    scope: integer("scope").notNull(),
    pcfStage: integer("pcf_stage").notNull(),
  },
  (t) => ({
    unq: unique("emissions_composite_idx").on(
      t.companyId,
      t.yearMonth,
      t.source,
      t.scope,
      t.pcfStage
    ),
  })
);

export const emissionsRelations = relations(emissions, ({ one }) => ({
  company: one(companies, {
    fields: [emissions.companyId],
    references: [companies.id],
  }),
}));

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  resourceUid: varchar("resource_uid", { length: 50 })
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  dateTime: varchar("date_time", { length: 7 }).notNull(),
  content: text("content").notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  company: one(companies, {
    fields: [posts.resourceUid],
    references: [companies.id],
  }),
}));
