import { Project } from "../types/project";
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  TagIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void; // For handling card click, e.g., to open details or edit modal
}

const getStatusColor = (status: Project["status"]) => {
  switch (status) {
    case "Planning":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "In Progress":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Completed":
      return "bg-squadspot-primary/20 text-squadspot-primary border-squadspot-primary/30";
    case "On Hold":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "Cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const {
    name,
    description,
    imageUrl,
    customerName,
    technologies,
    status,
    projectUrl,
    startDate,
    endDate,
  } = project;

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Card click handler: open projectUrl in new tab
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCardClick = (_e: React.MouseEvent) => {
    if (projectUrl) {
      window.open(projectUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Edit icon click handler
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(project);
  };

  return (
    <div
      className={`relative bg-card text-card-foreground rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-squadspot-primary/50 flex flex-col cursor-pointer`}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      title={projectUrl ? `Open ${name}` : undefined}
    >
      {/* Edit Icon */}
      <button
        type="button"
        onClick={handleEditClick}
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-card hover:bg-muted border border-border text-muted-foreground hover:text-squadspot-primary transition-colors"
        title="Edit Project"
      >
        <PencilIcon className="h-5 w-5" />
      </button>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name} project image`}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <TagIcon className="h-16 w-16 text-muted-foreground/50" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-xl font-semibold text-squadspot-primary truncate"
            title={name}
          >
            {name}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {customerName && (
          <p className="text-sm text-muted-foreground mb-1">
            Client: {customerName}
          </p>
        )}

        <p className="text-sm text-muted-foreground mb-3 flex-grow min-h-[40px]">
          {description
            ? description.substring(0, 100) +
              (description.length > 100 ? "..." : "")
            : "No description available."}
        </p>

        {technologies && technologies.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
              Technologies:
            </h4>
            <div className="flex flex-wrap gap-1">
              {technologies.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full border border-transparent"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  + {technologies.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2 pt-3 border-t border-border/50">
          {(startDate || endDate) && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-squadspot-primary/80" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </div>
          )}

          {projectUrl && (
            <span className="flex items-center text-xs text-squadspot-primary hover:underline hover:opacity-80 transition-opacity cursor-pointer">
              View Project{" "}
              <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
