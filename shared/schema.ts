import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("patient"), // patient or doctor
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Measurement types table
export const measurementTypes = pgTable("measurement_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  unit: varchar("unit").notNull(),
  minValue: decimal("min_value", { precision: 10, scale: 2 }),
  maxValue: decimal("max_value", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Food contexts table
export const foodContexts = pgTable("food_contexts", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Measurements table
export const measurements = pgTable("measurements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  measurementTypeId: integer("measurement_type_id").notNull().references(() => measurementTypes.id),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  foodContextId: integer("food_context_id").references(() => foodContexts.id),
  notes: text("notes"),
  measuredAt: timestamp("measured_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor access table
export const doctorAccess = pgTable("doctor_access", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: varchar("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  permissions: jsonb("permissions").default(JSON.stringify({
    viewMeasurements: true,
    exportData: true,
    receiveNotifications: false
  })),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  measurements: many(measurements),
  patientAccess: many(doctorAccess, { relationName: "patient" }),
  doctorAccess: many(doctorAccess, { relationName: "doctor" }),
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
  user: one(users, {
    fields: [measurements.userId],
    references: [users.id],
  }),
  measurementType: one(measurementTypes, {
    fields: [measurements.measurementTypeId],
    references: [measurementTypes.id],
  }),
  foodContext: one(foodContexts, {
    fields: [measurements.foodContextId],
    references: [foodContexts.id],
  }),
}));

export const doctorAccessRelations = relations(doctorAccess, ({ one }) => ({
  patient: one(users, {
    fields: [doctorAccess.patientId],
    references: [users.id],
    relationName: "patient",
  }),
  doctor: one(users, {
    fields: [doctorAccess.doctorId],
    references: [users.id],
    relationName: "doctor",
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true,
  createdAt: true,
});
export const insertMeasurementTypeSchema = createInsertSchema(measurementTypes).omit({
  id: true,
  createdAt: true,
});
export const insertFoodContextSchema = createInsertSchema(foodContexts).omit({
  id: true,
  createdAt: true,
});
export const insertDoctorAccessSchema = createInsertSchema(doctorAccess).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurements.$inferSelect;
export type MeasurementType = typeof measurementTypes.$inferSelect;
export type FoodContext = typeof foodContexts.$inferSelect;
export type DoctorAccess = typeof doctorAccess.$inferSelect;
export type InsertMeasurementType = z.infer<typeof insertMeasurementTypeSchema>;
export type InsertFoodContext = z.infer<typeof insertFoodContextSchema>;
export type InsertDoctorAccess = z.infer<typeof insertDoctorAccessSchema>;
