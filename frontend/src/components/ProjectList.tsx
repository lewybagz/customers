import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Project } from "../types/project";
import ProjectCard from "./ProjectCard";
import Modal from "./Modal"; // Assuming you have a Modal component
import ProjectForm from "./ProjectForm";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(
    undefined
  );

  useEffect(() => {
    setIsLoading(true);
    const projectsQuery = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Project, "id">),
          // Ensure dates are converted if they are Timestamps
          startDate: doc.data().startDate?.toDate
            ? doc.data().startDate.toDate()
            : doc.data().startDate,
          endDate: doc.data().endDate?.toDate
            ? doc.data().endDate.toDate()
            : doc.data().endDate,
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate
            ? doc.data().updatedAt.toDate()
            : doc.data().updatedAt,
        }));
        setProjects(projectsData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingProject(undefined);
    // Data will refresh via onSnapshot
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-card to-card/80 p-8 rounded-2xl shadow-lg animate-pulse backdrop-blur-sm border border-border/50"
          >
            <div className="h-48 bg-gradient-to-r from-muted to-muted/80 rounded-xl mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-muted to-muted/80 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-muted to-muted/80 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-muted to-muted/80 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-r from-muted to-muted/80 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-8 border border-destructive/20">
          <svg
            className="mx-auto h-16 w-16 text-destructive mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-destructive text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-16 border-t border-gradient-to-r from-tovuti-primary/30 via-tovuti-primary/50 to-tovuti-primary/30">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl text-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/80 bg-clip-text text-transparent">
            Projects
          </h2>
          <p className="mt-2 text-muted-foreground">
            Manage and track your client projects
          </p>
        </div>
        <button
          onClick={handleAddProject}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-primary-foreground bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 hover:from-tovuti-primary/90 hover:to-tovuti-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tovuti-primary focus:ring-offset-background transition-all duration-200 transform hover:scale-105"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add New Project
        </button>
      </div>

      {projects.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-gradient-to-br from-card to-card/80 rounded-2xl shadow-lg border border-border/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-tovuti-primary/10 to-tovuti-primary/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 text-tovuti-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          </div>
          <h3 className="text-xl text-card-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Get started by adding your first project. Track progress, manage
            timelines, and showcase your work.
          </p>
          <button
            onClick={handleAddProject}
            type="button"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-tovuti-primary to-tovuti-primary/90 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:from-tovuti-primary/90 hover:to-tovuti-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tovuti-primary transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleEditProject}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProject(undefined);
          }}
          title={editingProject ? "Edit Project" : "Add New Project"}
        >
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProject(undefined);
            }}
            initialData={editingProject}
            isEditing={!!editingProject}
          />
        </Modal>
      )}
    </div>
  );
}
