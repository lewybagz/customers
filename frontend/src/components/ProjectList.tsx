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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-card p-6 rounded-lg shadow-sm animate-pulse"
          >
            <div className="h-40 bg-muted rounded mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6 mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 border-t border-squadspot-primary/70">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
        <button
          onClick={handleAddProject}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-squadspot-primary hover:bg-squadspot-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-squadspot-primary focus:ring-offset-background"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add New Project
        </button>
      </div>

      {projects.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-card rounded-lg shadow-sm border border-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-card-foreground">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first project.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddProject}
              type="button"
              className="inline-flex items-center rounded-md bg-squadspot-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-squadspot-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-squadspot-primary"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
