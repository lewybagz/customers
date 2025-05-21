import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const projectStatusEnum = z.enum([
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
]);

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  projectUrl: z.string().url("Invalid project URL").or(z.literal("")),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional(), // Will be populated or fetched
  technologies: z.array(z.string()).optional(),
  status: projectStatusEnum,
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export interface Project extends ProjectFormData {
  id: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
} 