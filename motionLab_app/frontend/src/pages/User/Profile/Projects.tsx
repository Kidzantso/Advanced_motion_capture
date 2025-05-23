import { useEffect, useState } from "react";

import ProjectCard from "@components/cards/ProjectCard";

import useUserStore from "@/store/useUserStore";
import useProjectStore from "@/store/useProjectStore";

import LoadingSpinner from "@/components/UI/LoadingSpinner";
import FormButton from "@/components/UI/FormButton";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/UI/EmptyState";

const Projects: React.FC = () => {
    const { user } = useUserStore();
    const { projects, fetchProjects: fetchProjectsStoreFunc } = useProjectStore();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        if (!user || !user.id) return;

        const fetchProjects = async () => {
            setLoading(true);
            await fetchProjectsStoreFunc(user.id.toString());
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };

        fetchProjects();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center w-full min-h-[40vh]">
                <LoadingSpinner size={125} />
            </div>
        );

    }

    return (
        <div className="flex flex-col items-center gap-y-8">
            <div className="text-center">
                <h1 className="mb-2 font-bold text-white text-5xl">Your Projects</h1>
                <p className="text-gray-300 text-lg">Here are the projects you have created.</p>
            </div>

            <FormButton
                label="Upload a Video"
                onClick={() => navigate("/upload")}
                loading={loading}
                // theme="dark"
                fullWidth={false}
            />

            <div className="flex flex-row flex-wrap justify-center items-center gap-4 w-full">

                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        id={project.id}
                        name={project.name}
                        is_processing={project.is_processing}
                        creationDate={project.creation_date}
                    />
                ))}
            </div>

            {projects.length === 0 && (
                <EmptyState
                    title="No projects found"
                    description="You can create a project by clicking the button above"
                />
            )}
        </div>
    );
};

export default Projects;
