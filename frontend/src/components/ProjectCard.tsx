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
      return "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/20";
    case "In Progress":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20";
    case "Completed":
      return "bg-tovuti-primary/20 text-tovuti-primary border-tovuti-primary/30 shadow-tovuti-primary/20";
    case "On Hold":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30 shadow-gray-500/20";
    case "Cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30 shadow-destructive/20";
    default:
      return "bg-muted/20 text-muted-foreground border-border shadow-muted/20";
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
      className={`group relative bg-gradient-to-br from-card to-card/80 text-card-foreground rounded-2xl border border-border/50 shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-tovuti-primary/50 hover:-translate-y-2 flex flex-col cursor-pointer backdrop-blur-sm`}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      title={projectUrl ? `Open ${name}` : undefined}
    >
      {/* Edit Icon */}
      <button
        type="button"
        onClick={handleEditClick}
        className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-card/90 hover:bg-muted/90 border border-border/50 text-muted-foreground hover:text-tovuti-primary transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-lg backdrop-blur-sm"
        title="Edit Project"
      >
        <PencilIcon className="h-5 w-5" />
      </button>

      {imageUrl ? (
        <div className="relative overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={`${name} project image`}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-tovuti-primary/5 to-tovuti-primary/10"></div>
          <TagIcon className="h-20 w-20 text-muted-foreground/30 relative z-10" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="text-xl text-tovuti-primary truncate flex-1 mr-2"
            title={name}
          >
            {name}
          </h3>
          <span
            className={`px-3 py-1.5 text-xs rounded-xl border shadow-sm ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        {customerName && (
          <div className="mb-3 p-3 bg-gradient-to-r from-tovuti-primary/5 to-tovuti-primary/10 rounded-xl border border-tovuti-primary/20">
            <p className="text-sm font-semibold text-tovuti-primary">
              Client: {customerName}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 flex-grow min-h-[60px] leading-relaxed">
          {description
            ? description.substring(0, 120) +
              (description.length > 120 ? "..." : "")
            : "No description available."}
        </p>

        {technologies && technologies.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
              Technologies:
            </h4>
            <div className="flex flex-wrap gap-2">
              {technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-lg border border-border/30 shadow-sm"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > 4 && (
                <span className="text-xs text-muted-foreground font-medium px-2 py-1">
                  +{technologies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-3 pt-4 border-t border-border/30">
          {(startDate || endDate) && (
            <div className="flex items-center text-xs text-muted-foreground bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-2">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-tovuti-primary/80" />
              <span className="font-medium">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>
          )}

          {projectUrl && (
            <div className="flex items-center text-xs text-tovuti-primary hover:text-tovuti-primary/80 transition-colors cursor-pointer font-semibold bg-gradient-to-r from-tovuti-primary/10 to-tovuti-primary/5 rounded-lg p-2 border border-tovuti-primary/20">
              <span className="flex items-center">
                View Project{" "}
                <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
