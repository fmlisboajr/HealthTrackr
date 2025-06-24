import {
  users,
  measurements,
  measurementTypes,
  foodContexts,
  doctorAccess,
  type User,
  type UpsertUser,
  type Measurement,
  type InsertMeasurement,
  type MeasurementType,
  type FoodContext,
  type DoctorAccess,
  type InsertMeasurementType,
  type InsertFoodContext,
  type InsertDoctorAccess,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Measurement operations
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  getMeasurements(userId: string, limit?: number): Promise<Measurement[]>;
  getMeasurementsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Measurement[]>;
  updateMeasurement(id: number, measurement: Partial<InsertMeasurement>): Promise<Measurement>;
  deleteMeasurement(id: number, userId: string): Promise<void>;
  
  // Measurement type operations
  getMeasurementTypes(): Promise<MeasurementType[]>;
  createMeasurementType(type: InsertMeasurementType): Promise<MeasurementType>;
  updateMeasurementType(id: number, type: Partial<InsertMeasurementType>): Promise<MeasurementType>;
  
  // Food context operations
  getFoodContexts(): Promise<FoodContext[]>;
  createFoodContext(context: InsertFoodContext): Promise<FoodContext>;
  updateFoodContext(id: number, context: Partial<InsertFoodContext>): Promise<FoodContext>;
  
  // Doctor access operations
  getDoctorAccess(patientId: string): Promise<DoctorAccess[]>;
  createDoctorAccess(access: InsertDoctorAccess): Promise<DoctorAccess>;
  updateDoctorAccess(id: number, access: Partial<InsertDoctorAccess>): Promise<DoctorAccess>;
  deleteDoctorAccess(id: number): Promise<void>;
  getPatientsByDoctor(doctorId: string): Promise<User[]>;
  
  // Statistics
  getMeasurementStats(userId: string, measurementTypeId: number, days: number): Promise<{
    average: number;
    count: number;
    min: number;
    max: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Measurement operations
  async createMeasurement(measurement: InsertMeasurement): Promise<Measurement> {
    const [result] = await db
      .insert(measurements)
      .values(measurement)
      .returning();
    return result;
  }

  async getMeasurements(userId: string, limit = 1000): Promise<Measurement[]> {
    return await db
      .select()
      .from(measurements)
      .where(eq(measurements.userId, userId))
      .orderBy(desc(measurements.measuredAt))
      .limit(limit);
  }

  async getMeasurementsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Measurement[]> {
    return await db
      .select()
      .from(measurements)
      .where(
        and(
          eq(measurements.userId, userId),
          gte(measurements.measuredAt, startDate),
          lte(measurements.measuredAt, endDate)
        )
      )
      .orderBy(desc(measurements.measuredAt));
  }

  async updateMeasurement(id: number, measurement: Partial<InsertMeasurement>): Promise<Measurement> {
    const [result] = await db
      .update(measurements)
      .set(measurement)
      .where(eq(measurements.id, id))
      .returning();
    return result;
  }

  async deleteMeasurement(id: number, userId: string): Promise<void> {
    await db
      .delete(measurements)
      .where(and(eq(measurements.id, id), eq(measurements.userId, userId)));
  }

  // Measurement type operations
  async getMeasurementTypes(): Promise<MeasurementType[]> {
    return await db
      .select()
      .from(measurementTypes)
      .where(eq(measurementTypes.isActive, true))
      .orderBy(measurementTypes.name);
  }

  async createMeasurementType(type: InsertMeasurementType): Promise<MeasurementType> {
    const [result] = await db
      .insert(measurementTypes)
      .values(type)
      .returning();
    return result;
  }

  async updateMeasurementType(id: number, type: Partial<InsertMeasurementType>): Promise<MeasurementType> {
    const [result] = await db
      .update(measurementTypes)
      .set(type)
      .where(eq(measurementTypes.id, id))
      .returning();
    return result;
  }

  // Food context operations
  async getFoodContexts(): Promise<FoodContext[]> {
    return await db
      .select()
      .from(foodContexts)
      .where(eq(foodContexts.isActive, true))
      .orderBy(foodContexts.name);
  }

  async createFoodContext(context: InsertFoodContext): Promise<FoodContext> {
    const [result] = await db
      .insert(foodContexts)
      .values(context)
      .returning();
    return result;
  }

  async updateFoodContext(id: number, context: Partial<InsertFoodContext>): Promise<FoodContext> {
    const [result] = await db
      .update(foodContexts)
      .set(context)
      .where(eq(foodContexts.id, id))
      .returning();
    return result;
  }

  // Doctor access operations
  async getDoctorAccess(patientId: string): Promise<DoctorAccess[]> {
    return await db
      .select()
      .from(doctorAccess)
      .where(and(eq(doctorAccess.patientId, patientId), eq(doctorAccess.isActive, true)));
  }

  async createDoctorAccess(access: InsertDoctorAccess): Promise<DoctorAccess> {
    const [result] = await db
      .insert(doctorAccess)
      .values(access)
      .returning();
    return result;
  }

  async updateDoctorAccess(id: number, access: Partial<InsertDoctorAccess>): Promise<DoctorAccess> {
    const [result] = await db
      .update(doctorAccess)
      .set(access)
      .where(eq(doctorAccess.id, id))
      .returning();
    return result;
  }

  async deleteDoctorAccess(id: number): Promise<void> {
    await db.delete(doctorAccess).where(eq(doctorAccess.id, id));
  }

  async getPatientsByDoctor(doctorId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(doctorAccess)
      .innerJoin(users, eq(doctorAccess.patientId, users.id))
      .where(and(eq(doctorAccess.doctorId, doctorId), eq(doctorAccess.isActive, true)));
    
    return result.map(r => r.user);
  }

  // Statistics
  async getMeasurementStats(userId: string, measurementTypeId: number, days: number): Promise<{
    average: number;
    count: number;
    min: number;
    max: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [result] = await db
      .select({
        average: sql<number>`COALESCE(AVG(${measurements.value}), 0)`,
        count: sql<number>`COUNT(*)`,
        min: sql<number>`COALESCE(MIN(${measurements.value}), 0)`,
        max: sql<number>`COALESCE(MAX(${measurements.value}), 0)`,
      })
      .from(measurements)
      .where(
        and(
          eq(measurements.userId, userId),
          eq(measurements.measurementTypeId, measurementTypeId),
          gte(measurements.measuredAt, startDate)
        )
      );

    return {
      average: Number(result.average) || 0,
      count: Number(result.count) || 0,
      min: Number(result.min) || 0,
      max: Number(result.max) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
