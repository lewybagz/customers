import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().min(1, "Company name is required"),
  status: z.enum(["active", "inactive"]),
  price: z.number().min(0, "Price must be a positive number"),
  hasPaid: z.boolean(),
  paidDate: z.date().nullable(),
  notes: z.string().optional(),
  softwareUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  thirdPartyServices: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CustomerFormData> & { id?: string };
  isEditing?: boolean;
}

export default function CustomerForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      status: "active",
      hasPaid: false,
      paidDate: null,
      price: 0,
      softwareUrl: "",
      notes: "",
      thirdPartyServices: "",
      ...initialData,
    },
  });

  const hasPaid = watch("hasPaid");

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (isEditing && initialData?.id) {
        // Update existing customer
        const customerRef = doc(db, "customers", initialData.id);
        await updateDoc(customerRef, {
          ...data,
          updatedAt: new Date(),
        });
        toast.success("Customer updated successfully");
      } else {
        // Add new customer
        const customersRef = collection(db, "customers");
        await addDoc(customersRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success("Customer added successfully");
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(
        isEditing ? "Failed to update customer" : "Failed to add customer"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
          <div className="border-b border-tovuti-primary/20 pb-4">
            <h3 className="text-xl leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
              Basic Information
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customer's primary contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Name <span className="text-destructive">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                    ${
                      errors.name
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                    ${
                      errors.email
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="john@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Phone <span className="text-destructive">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", {
                    onChange: (e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setValue("phone", formatted, { shouldValidate: true });
                    },
                  })}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                    ${
                      errors.phone
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="(555) 123-4567"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Company Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="company"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Company <span className="text-destructive">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="text"
                  id="company"
                  {...register("company")}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                    ${
                      errors.company
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="Acme Inc."
                  disabled={isSubmitting}
                />
                {errors.company && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.company && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.company.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status and Financials */}
        <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
          <div className="border-b border-tovuti-primary/20 pb-4">
            <h3 className="text-xl leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
              Status & Financials
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customer status, pricing, and payment information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Status Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Status <span className="text-destructive">*</span>
              </label>
              <select
                id="status"
                {...register("status")}
                className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                  ${
                    errors.status
                      ? "border-destructive text-destructive bg-destructive/5"
                      : "border-tovuti-primary/50 hover:border-tovuti-primary"
                  }`}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Price Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Price ($) <span className="text-destructive">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  placeholder="0"
                  {...register("price", { valueAsNumber: true })}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
    ${
      errors.price
        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
        : "border-tovuti-primary/50 hover:border-tovuti-primary"
    }`}
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.price && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Has Paid Field (Toggle Switch) */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-between p-6 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30">
              <label
                htmlFor="hasPaid"
                className="block text-sm font-semibold text-card-foreground"
              >
                Payment Received
              </label>
              <button
                type="button"
                id="hasPaid"
                onClick={() =>
                  setValue("hasPaid", !hasPaid, { shouldValidate: true })
                }
                className={`${
                  hasPaid
                    ? "bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 shadow-lg"
                    : "bg-muted"
                }
                  relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-all ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:ring-offset-2 disabled:opacity-50 transform hover:scale-105`}
                disabled={isSubmitting}
              >
                <span className="sr-only">Has Paid</span>
                <span
                  aria-hidden="true"
                  className={`${hasPaid ? "translate-x-5" : "translate-x-0"}
                    pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-300`}
                />
              </button>
              {errors.hasPaid && (
                <p className="ml-3 text-sm text-destructive font-medium">
                  {errors.hasPaid.message}
                </p>
              )}
            </div>

            {/* Paid Date Field (Conditional) */}
            {hasPaid && (
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="paidDate"
                  className="block text-sm font-semibold text-card-foreground mb-2"
                >
                  Paid Date
                </label>
                <div className="react-datepicker-wrapper">
                  <DatePicker
                    id="paidDate"
                    selected={watch("paidDate")}
                    onChange={(date: Date | null) =>
                      setValue("paidDate", date, { shouldValidate: true })
                    }
                    className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                      ${
                        errors.paidDate
                          ? "border-destructive text-destructive bg-destructive/5"
                          : "border-tovuti-primary/50 hover:border-tovuti-primary"
                      }`}
                    placeholderText="Select date"
                    dateFormat="MM/dd/yyyy"
                    isClearable
                    showPopperArrow={false}
                    disabled={isSubmitting}
                    popperClassName="!z-[60]" // Ensure popper is above modal content
                  />
                </div>
                {errors.paidDate && (
                  <p className="mt-2 text-sm text-destructive font-medium">
                    {errors.paidDate.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg border border-border/50 space-y-6 backdrop-blur-sm">
          <div className="border-b border-tovuti-primary/20 pb-4">
            <h3 className="text-xl leading-6 text-card-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
              Additional Information
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Software/Website URL and any relevant notes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Software URL Field */}
            <div>
              <label
                htmlFor="softwareUrl"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Software/Website URL (Optional)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="url"
                  id="softwareUrl"
                  {...register("softwareUrl")}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent
                    ${
                      errors.softwareUrl
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="https://app.example.com/customer-portal"
                  disabled={isSubmitting}
                />
                {errors.softwareUrl && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {errors.softwareUrl && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.softwareUrl.message}
                </p>
              )}
            </div>

            {/* Notes Field */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Notes (Optional)
              </label>
              <div>
                <textarea
                  id="notes"
                  rows={4}
                  {...register("notes")}
                  className={`block w-full rounded-xl shadow-sm sm:text-sm transition duration-200 ease-in-out bg-input/80 backdrop-blur-sm border placeholder-muted-foreground text-foreground px-4 py-3 focus:ring-2 focus:ring-tovuti-primary focus:border-transparent resize-none
                    ${
                      errors.notes
                        ? "border-destructive text-destructive placeholder-destructive/70 bg-destructive/5"
                        : "border-tovuti-primary/50 hover:border-tovuti-primary"
                    }`}
                  placeholder="Any additional details about the customer..."
                  disabled={isSubmitting}
                />
              </div>
              {errors.notes && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  {errors.notes.message}
                </p>
              )}
            </div>
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
              className="px-6 py-3 text-sm font-semibold rounded-xl shadow-sm border border-border text-secondary-foreground bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-6 py-3 text-sm font-semibold rounded-xl shadow-lg text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary focus:outline-none focus:ring-2 focus:ring-tovuti-primary focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditing ? "Saving..." : "Adding..."}
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Customer"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
