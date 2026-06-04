CREATE TABLE "companies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country_code" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"code" varchar(2) PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar(50) NOT NULL,
	"year_month" varchar(7) NOT NULL,
	"source" text NOT NULL,
	"emissions" double precision NOT NULL,
	"scope" integer NOT NULL,
	"pcf_stage" integer NOT NULL,
	CONSTRAINT "emissions_composite_idx" UNIQUE("company_id","year_month","source","scope","pcf_stage")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"resource_uid" varchar(50) NOT NULL,
	"date_time" varchar(7) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_country_code_countries_code_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emissions" ADD CONSTRAINT "emissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_resource_uid_companies_id_fk" FOREIGN KEY ("resource_uid") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;