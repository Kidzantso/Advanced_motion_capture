import FormButton from "@/components/UI/FormButton";
import LoadingSpinner from "@components/UI/LoadingSpinner";
import ErrorMessage from "@/components/UI/ErrorMessage";
import React from "react";

interface UploadVideoSectionProps {
  handleUpload: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  file: File | null;
  progress: number;
  error?: string | null;
}

const UploadVideoSection: React.FC<UploadVideoSectionProps> = ({ handleUpload, handleFileChange, loading, file, progress, error }) => {

  return (
    <div className="flex flex-col justify-center items-center px-8 w-full text-white">

      {!loading && (
        <div className="bg-gray-800 shadow-lg p-6 border border-purple-600 rounded-lg w-full max-w-md">
          <label
            htmlFor="file-upload"
            className="flex flex-col justify-center items-center bg-gray-900 hover:bg-gray-800 border-2 border-purple-600 border-dashed rounded-lg h-40 transition cursor-pointer"
          >
            {file ? (
              <p className="text-purple-400 text-sm">{file.name}</p>
            ) : (
              <>
                <svg
                  className="mb-2 w-12 h-12 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v1.25A2.25 2.25 0 005.25 20h13.5A2.25 2.25 0 0021 17.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                  ></path>
                </svg>
                <p className="mt-2 text-gray-500 text-xs">Supported format: MP4</p>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".mp4"
              onChange={handleFileChange}
            />
          </label>

          {/* Video Requirements and Recommendations */}
          <div className="mt-4 text-gray-400 text-sm">
            <h3 className="mb-2 font-semibold text-gray-300">Video Requirements:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Maximum file size: 150MB</li>
              <li>Maximum duration: 1 minute</li>
            </ul>
            
            <h3 className="mt-4 mb-2 font-semibold text-gray-300">Recommendations:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li className="text-yellow-300">Ensure the full body is visible in the video for best results</li>
              <li>Person should take up a significant portion of the video frame</li>
              <li>If the person appears too small, they may not be detected properly</li>
            </ul>
          </div>
        </div>
      )}

      {progress > 0 && (

        <div className="mt-4 w-full max-w-md">
          {!loading && (
            <>
              <div className="relative bg-gray-900 rounded-lg h-4">
                <div
                  className="bg-purple-600 rounded-lg h-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="mt-2 text-gray-300 text-sm text-center">
                Upload Progress: {progress}%
              </p>
            </>
          )}


          {/* Show a spinner when upload is complete (100%) and waiting for response */}
          {progress === 100 && loading && (
            <>

              <LoadingSpinner
                size={100}
                extraStyles="m-4"
              />
              <p className="mt-2 text-bold text-gray-300 text-sm text-center">
                Processing your video...
              </p>
            </>
          )}
        </div>
      )}

      {!loading && (
        <div className="flex space-x-4 mt-6">
          <FormButton
            type="button"
            label={loading ? "Uploading..." : "Upload and Visualize"}
            loading={loading}
            onClick={handleUpload}
          />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} className="mt-4" />
      )}

    </div>
  );
};

export default UploadVideoSection;