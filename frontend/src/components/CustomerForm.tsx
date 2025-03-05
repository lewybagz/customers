import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/apollo-client";
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
      ...initialData,
    },
  });

  const hasPaid = watch("hasPaid");

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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Customer's primary contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Name Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.name
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.email
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-900"
              >
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.phone
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Company Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-900"
              >
                Company <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="company"
                  {...register("company")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.company
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="Company Name"
                />
                {errors.company && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.company.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Business Details
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Customer's business and payment information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Price Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-900"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  {...register("price", { valueAsNumber: true })}
                  className={`pl-7 block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.price
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="0.00"
                  step="0.01"
                />
                {errors.price && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Software URL Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="softwareUrl"
                className="block text-sm font-medium text-gray-900"
              >
                Software URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="url"
                  id="softwareUrl"
                  {...register("softwareUrl")}
                  className={`block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out
                    ${
                      errors.softwareUrl
                        ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  placeholder="https://example.com"
                />
                {errors.softwareUrl && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
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
                <p className="mt-2 text-sm text-red-600">
                  {errors.softwareUrl.message}
                </p>
              )}
            </div>

            {/* Status Field */}
            <div className="col-span-2 sm:col-span-1">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-900"
              >
                Status
              </label>
              <select
                id="status"
                {...register("status")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Payment Status Section */}
            <div className="col-span-2 bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPaid"
                  {...register("hasPaid")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
                />
                <label
                  htmlFor="hasPaid"
                  className="ml-2 block text-sm font-medium text-gray-900"
                >
                  Payment Received
                </label>
              </div>

              {hasPaid && (
                <div className="animate-fadeIn">
                  <label
                    htmlFor="paidDate"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Payment Date
                  </label>
                  <DatePicker
                    selected={watch("paidDate")}
                    onChange={(date) => setValue("paidDate", date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select payment date"
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Additional Notes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Any extra information about the customer.
            </p>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-900"
            >
              Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                rows={4}
                {...register("notes")}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Add any additional notes here..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {isEditing ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{isEditing ? "Update Customer" : "Add Customer"}</>
          )}
        </button>
      </div>
    </form>
  );
}
