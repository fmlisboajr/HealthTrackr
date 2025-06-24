import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMeasurementSchema, 
  insertMeasurementTypeSchema, 
  insertFoodContextSchema,
  insertDoctorAccessSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Measurement routes
  app.get('/api/measurements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const measurements = await storage.getMeasurements(userId, limit);
      res.json(measurements);
    } catch (error) {
      console.error("Error fetching measurements:", error);
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.get('/api/measurements/range', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const measurements = await storage.getMeasurementsByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(measurements);
    } catch (error) {
      console.error("Error fetching measurements by date range:", error);
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post('/api/measurements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Received measurement data:", req.body);
      
      const measurementData = insertMeasurementSchema.parse({
        ...req.body,
        userId,
        measuredAt: new Date(req.body.measuredAt),
      });
      
      const measurement = await storage.createMeasurement(measurementData);
      res.json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid measurement data", errors: error.errors });
      }
      console.error("Error creating measurement:", error);
      res.status(500).json({ message: "Failed to create measurement" });
    }
  });

  app.put('/api/measurements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const measurementData = insertMeasurementSchema.partial().parse(req.body);
      
      const measurement = await storage.updateMeasurement(id, measurementData);
      res.json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid measurement data", errors: error.errors });
      }
      console.error("Error updating measurement:", error);
      res.status(500).json({ message: "Failed to update measurement" });
    }
  });

  app.delete('/api/measurements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.deleteMeasurement(id, userId);
      res.json({ message: "Measurement deleted successfully" });
    } catch (error) {
      console.error("Error deleting measurement:", error);
      res.status(500).json({ message: "Failed to delete measurement" });
    }
  });

  // Measurement types routes
  app.get('/api/measurement-types', isAuthenticated, async (req, res) => {
    try {
      const types = await storage.getMeasurementTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching measurement types:", error);
      res.status(500).json({ message: "Failed to fetch measurement types" });
    }
  });

  app.post('/api/measurement-types', isAuthenticated, async (req, res) => {
    try {
      const typeData = insertMeasurementTypeSchema.parse(req.body);
      const type = await storage.createMeasurementType(typeData);
      res.json(type);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid measurement type data", errors: error.errors });
      }
      console.error("Error creating measurement type:", error);
      res.status(500).json({ message: "Failed to create measurement type" });
    }
  });

  // Food contexts routes
  app.get('/api/food-contexts', isAuthenticated, async (req, res) => {
    try {
      const contexts = await storage.getFoodContexts();
      res.json(contexts);
    } catch (error) {
      console.error("Error fetching food contexts:", error);
      res.status(500).json({ message: "Failed to fetch food contexts" });
    }
  });

  app.post('/api/food-contexts', isAuthenticated, async (req, res) => {
    try {
      const contextData = insertFoodContextSchema.parse(req.body);
      const context = await storage.createFoodContext(contextData);
      res.json(context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid food context data", errors: error.errors });
      }
      console.error("Error creating food context:", error);
      res.status(500).json({ message: "Failed to create food context" });
    }
  });

  // Doctor access routes
  app.get('/api/doctor-access', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType === 'doctor') {
        const patients = await storage.getPatientsByDoctor(userId);
        res.json(patients);
      } else {
        const doctorAccess = await storage.getDoctorAccess(userId);
        res.json(doctorAccess);
      }
    } catch (error) {
      console.error("Error fetching doctor access:", error);
      res.status(500).json({ message: "Failed to fetch doctor access" });
    }
  });

  app.post('/api/doctor-access', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const { doctorEmail } = req.body;
      
      // Find doctor by email
      const doctor = await storage.getUserByEmail(doctorEmail);
      if (!doctor || doctor.userType !== 'doctor') {
        return res.status(404).json({ message: "Doctor not found" });
      }

      const accessData = insertDoctorAccessSchema.parse({
        patientId,
        doctorId: doctor.id,
      });
      
      const access = await storage.createDoctorAccess(accessData);
      res.json(access);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid doctor access data", errors: error.errors });
      }
      console.error("Error creating doctor access:", error);
      res.status(500).json({ message: "Failed to create doctor access" });
    }
  });

  app.delete('/api/doctor-access/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDoctorAccess(id);
      res.json({ message: "Doctor access removed successfully" });
    } catch (error) {
      console.error("Error removing doctor access:", error);
      res.status(500).json({ message: "Failed to remove doctor access" });
    }
  });

  // Statistics routes
  app.get('/api/statistics/:measurementTypeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const measurementTypeId = parseInt(req.params.measurementTypeId);
      const days = parseInt(req.query.days as string) || 30;
      
      const stats = await storage.getMeasurementStats(userId, measurementTypeId, days);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Initialize default data
  app.post('/api/init', isAuthenticated, async (req, res) => {
    try {
      // Create default measurement types
      const defaultTypes = [
        { name: "Glicose", unit: "mg/dL", minValue: "70", maxValue: "200" },
        { name: "Pressão Arterial", unit: "mmHg", minValue: "90", maxValue: "180" },
        { name: "Peso", unit: "kg", minValue: "30", maxValue: "200" },
        { name: "Temperatura", unit: "°C", minValue: "35", maxValue: "42" },
      ];

      const defaultContexts = [
        { name: "Jejum" },
        { name: "Pré-refeição" },
        { name: "Pós-refeição" },
        { name: "Após medicação" },
        { name: "Outros" },
      ];

      // Check if data already exists
      const existingTypes = await storage.getMeasurementTypes();
      if (existingTypes.length === 0) {
        for (const type of defaultTypes) {
          await storage.createMeasurementType(type);
        }
      }

      const existingContexts = await storage.getFoodContexts();
      if (existingContexts.length === 0) {
        for (const context of defaultContexts) {
          await storage.createFoodContext(context);
        }
      }

      res.json({ message: "Default data initialized successfully" });
    } catch (error) {
      console.error("Error initializing default data:", error);
      res.status(500).json({ message: "Failed to initialize default data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
