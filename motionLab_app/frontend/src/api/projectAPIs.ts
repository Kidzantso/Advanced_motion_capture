import axios from "axios";
import { ApiResponse } from "@/types/apiTypes"; // Adjust the import path as needed
import { serverURL } from "./config";

const axiosInstance = axios.create({
    baseURL: serverURL + '/project',
    headers: {
        "Content-Type": "application/json",
    },
});

// Replace `any` with the appropriate type if known

export const getProjectsByUser = async (
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.get(`/get-projects`, {
            params: { userId },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching projects by user:", error.message);
        return { success: false, data: error.message };
    }
};

export const getProjectById = async (
    projectId: string,
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.get(`/get-project`, {
            params: { projectId, userId },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching project by ID:", error.message);
        return { success: false, data: error.message };
    }
}

export const deleteProjectById = async (
    projectId: string,
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.delete<ApiResponse<any>>(
            `/delete-project`, {
            params: { projectId, userId },
        }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error deleting project:", error.message);
        return { success: false, data: error.message };
    }
};

export const getProjectBVHFilenames = async (
    projectId: string,
    userId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.get<ApiResponse<any>>(
            `/get-bvh-filenames`, {
            params: { projectId, userId },
        }
        );
        console.log("Response from getProjectBVHFilenames:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching BVH filenames:", error.message);
        // get the error message from the response if available
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Error message:", errorMessage);
        return { success: false, data: errorMessage };

    }
};

export const createRetargetedAvatar = async (
    projectId: string,
    userId: string,
    bvhFilename: string,
    selectedAvatarId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/create-retargeted-avatar`, {
            projectId,
            userId,
            bvhFilename,
            avatarId: selectedAvatarId,
        }
        );
        return response.data;
    }
    catch (error: any) {
        console.error("Error creating retargeted avatar:", error.message);
        // get the error message from the response if available
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Error message:", errorMessage);
        return { success: false, data: errorMessage };
    }
}

export const getRetargetedAvatars = async (
    projectId: string
): Promise<ApiResponse<any>> => {
    try {
        const response = await axios.get<ApiResponse<any>>(
            `${serverURL}/retargeted-avatars/${projectId}`
        );
        return response.data;
    } catch (error: any) {
        console.error("Error fetching retargeted avatars:", error.message);
        return { success: false, data: error.message };
    }
};

export const deleteRetargetedAvatar = async (
    avatarId: number
): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.delete<ApiResponse<any>>(
            `/retargeted-avatars`, {
            data: { avatarId }
        }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error deleting retargeted avatar:", error.message);
        return { success: false, data: error.message };
    }
};


