import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ProjectFormData,
  projectSchema,
  projectStatusEnum,
} from "../types/project";
import { useEffect, useState } from "react";

interface CustomerSelectItem {
  id: string;
  name: string;
  company?: string;
}

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ProjectFormData> & { id?: string };
  isEditing?: boolean;
}

export default function ProjectForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: ProjectFormProps) {
  const [customers, setCustomers] = useState<CustomerSelectItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [technologiesInput, setTechnologiesInput] = useState(
    Array.isArray(initialData?.technologies)
      ? initialData.technologies.join(", ")
      : ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      projectUrl: "",
      imageUrl: "",
      customerId: "",
      customerName: "", // This will be set based on customerId selection
      technologies: [],
      status: "Planning",
      startDate: null,
      endDate: null,
      ...initialData,
    },
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const customersSnapshot = await getDocs(collection(db, "customers"));
        const customersList = customersSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              name: doc.data().name,
              company: doc.data().company,
            } as CustomerSelectItem)
        );
        setCustomers(customersList);
        if (initialData?.customerId && customersList.length > 0) {
          const selectedCustomer = customersList.find(
            (c) => c.id === initialData.customerId
          );
          if (selectedCustomer)
            setValue(
              "customerName",
              selectedCustomer.name +
                (selectedCustomer.company
                  ? ` (${selectedCustomer.company})`
                  : "")
            );
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers for selection.");
      }
      setIsLoadingCustomers(false);
    };
    fetchCustomers();
  }, [initialData?.customerId, setValue]);

  const selectedCustomerId = watch("customerId");

  useEffect(() => {
    if (selectedCustomerId) {
      const selectedCustomer = customers.find(
        (c) => c.id === selectedCustomerId
      );
      if (selectedCustomer) {
        setValue(
          "customerName",
          selectedCustomer.name +
            (selectedCustomer.company ? ` (${selectedCustomer.company})` : "")
        );
      }
    }
  }, [selectedCustomerId, customers, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    data.technologies = technologiesInput
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech);
    try {
      const finalData = { ...data };
      // Ensure customerName is set if not already (e.g. on initial submit without changing customer)
      if (!finalData.customerName && finalData.customerId) {
        const cust = customers.find((c) => c.id === finalData.customerId);
        if (cust) {
          finalData.customerName =
            cust.name + (cust.company ? ` (${cust.company})` : "");
        }
      }

      if (isEditing && initialData?.id) {
        const projectRef = doc(db, "projects", initialData.id);
        await updateDoc(projectRef, {
          ...finalData,
          updatedAt: new Date(),
        });
        toast.success("Project updated successfully");
      } else {
        const projectsRef = collection(db, "projects");
        await addDoc(projectsRef, {
          ...finalData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success("Project added successfully");
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(
        isEditing ? "Failed to update project" : "Failed to add project"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Project Details Section */}
      <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
        <div className="border-b border-tovuti-primary/20 pb-4">
          <h3 className="text-xl font-bold leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
            Project Details
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Core information about the project.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Project Name Field */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Project Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                errors.name
                  ? "border-destructive bg-destructive/5"
                  : "border-tovuti-primary/50 hover:border-tovuti-primary"
              }`}
              disabled={isSubmitting}
              placeholder="E-commerce Platform"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Customer Selection Field */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="customerId"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Customer <span className="text-destructive">*</span>
            </label>
            <select
              id="customerId"
              {...register("customerId")}
              className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                errors.customerId
                  ? "border-destructive bg-destructive/5"
                  : "border-tovuti-primary/50 hover:border-tovuti-primary"
              }`}
              disabled={isSubmitting || isLoadingCustomers}
            >
              <option value="">
                {isLoadingCustomers
                  ? "Loading customers..."
                  : "Select customer"}
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}{" "}
                  {customer.company ? `(${customer.company})` : ""}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {errors.customerId.message}
              </p>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-card-foreground mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            {...register("description")}
            className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent resize-none ${
              errors.description
                ? "border-destructive bg-destructive/5"
                : "border-tovuti-primary/50 hover:border-tovuti-primary"
            }`}
            disabled={isSubmitting}
            placeholder="Brief overview of the project features and goals."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-destructive font-medium">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Links & Media Section */}
      <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
        <div className="border-b border-tovuti-primary/20 pb-4">
          <h3 className="text-xl font-bold leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
            Links & Media
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Project URL Field */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="projectUrl"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Project URL
            </label>
            <input
              type="url"
              id="projectUrl"
              {...register("projectUrl")}
              className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                errors.projectUrl
                  ? "border-destructive bg-destructive/5"
                  : "border-tovuti-primary/50 hover:border-tovuti-primary"
              }`}
              disabled={isSubmitting}
              placeholder="https://project.example.com"
            />
            {errors.projectUrl && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {errors.projectUrl.message}
              </p>
            )}
          </div>

          {/* Image URL Field */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              {...register("imageUrl")}
              className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                errors.imageUrl
                  ? "border-destructive bg-destructive/5"
                  : "border-tovuti-primary/50 hover:border-tovuti-primary"
              }`}
              disabled={isSubmitting}
              placeholder="https://example.com/image.png"
            />
            {errors.imageUrl && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {errors.imageUrl.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
        <div className="border-b border-tovuti-primary/20 pb-4">
          <h3 className="text-xl font-bold leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
            Technical Details
          </h3>
        </div>
        {/* Technologies Field */}
        <div>
          <label
            htmlFor="technologies"
            className="block text-sm font-semibold text-card-foreground mb-2"
          >
            Technologies (comma-separated, e.g., React, Firebase, Node.js)
          </label>
          <input
            type="text"
            id="technologies"
            value={technologiesInput}
            onChange={(e) => setTechnologiesInput(e.target.value)}
            className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
              errors.technologies
                ? "border-destructive bg-destructive/5"
                : "border-tovuti-primary/50 hover:border-tovuti-primary"
            }`}
            disabled={isSubmitting}
            placeholder="React, Firebase, Stripe"
          />
          {errors.technologies && (
            <p className="mt-2 text-sm text-destructive font-medium">
              {typeof errors.technologies.message === "string"
                ? errors.technologies.message
                : "Invalid technologies format."}
            </p>
          )}
        </div>
      </div>

      {/* Status and Timeline Section */}
      <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
        <div className="border-b border-tovuti-primary/20 pb-4">
          <h3 className="text-xl font-bold leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
            Status & Timeline
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Status Field */}
          <div className="col-span-1">
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Status <span className="text-destructive">*</span>
            </label>
            <select
              id="status"
              {...register("status")}
              className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                errors.status
                  ? "border-destructive bg-destructive/5"
                  : "border-tovuti-primary/50 hover:border-tovuti-primary"
              }`}
              disabled={isSubmitting}
            >
              {projectStatusEnum.options.map((statusVal) => (
                <option key={statusVal} value={statusVal}>
                  {statusVal}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Start Date Field */}
          <div className="col-span-1">
            <label
              htmlFor="startDate"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Start Date (Optional)
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="startDate"
                  selected={field.value}
                  onChange={(date: Date | null) => field.onChange(date)}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                    errors.startDate
                      ? "border-destructive bg-destructive/5"
                      : "border-tovuti-primary/50 hover:border-tovuti-primary"
                  }`}
                  placeholderText="Select start date"
                  dateFormat="MM/dd/yyyy"
                  isClearable
                  showPopperArrow={false}
                  disabled={isSubmitting}
                  popperClassName="!z-[60]"
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {typeof errors.startDate.message === "string"
                  ? errors.startDate.message
                  : "Invalid date"}
              </p>
            )}
          </div>

          {/* End Date Field */}
          <div className="col-span-1">
            <label
              htmlFor="endDate"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              End Date (Optional)
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="endDate"
                  selected={field.value}
                  onChange={(date: Date | null) => field.onChange(date)}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 transition duration-200 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent ${
                    errors.endDate
                      ? "border-destructive bg-destructive/5"
                      : "border-tovuti-primary/50 hover:border-tovuti-primary"
                  }`}
                  placeholderText="Select end date"
                  dateFormat="MM/dd/yyyy"
                  isClearable
                  showPopperArrow={false}
                  disabled={isSubmitting}
                  popperClassName="!z-[60]"
                />
              )}
            />
            {errors.endDate && (
              <p className="mt-2 text-sm text-destructive font-medium">
                {typeof errors.endDate.message === "string"
                  ? errors.endDate.message
                  : "Invalid date"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-border/30">
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold rounded-xl shadow-sm border border-border text-secondary-foreground bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tovuti-primary focus:ring-offset-card disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-6 py-3 text-sm font-semibold rounded-xl shadow-lg text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tovuti-primary focus:ring-offset-card disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
              ? "Save Changes"
              : "Add Project"}
          </button>
        </div>
      </div>
    </form>
  );
}
