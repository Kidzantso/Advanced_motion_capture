import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../../../api/videoAPIs";
import UploadVideoSection from "./Sections/UploadVideoSection";
import UploadVideoSettingsSection from "./Sections/UploadVideoSettingsSection";

import { validateProjectSettings } from "../../../utils/validateProjectSettings";
import useUserStore from "../../../store/useUserStore";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    peopleCount: "single",
    outputFormat: "bvh",
    projectName: "",
  });

  const [settingsError, setSettingsError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const { user } = useUserStore();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setProgress(0);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      console.log("No file selected.");
      return;
    }

    const settingsValidation = validateProjectSettings(settings);
    if (!settingsValidation.success) {
      setSettingsError(settingsValidation.error);
      return false;
    }

    if (!user || !user.id) {
      alert("User ID not found.");
      return;
    }

    setTimeout(() => {
      setLoading(true);
    }, 1500);

    const response = await uploadVideo(file, settings.projectName, user.id, (progress) => {
      setProgress(progress);
    });

    setLoading(false);

    if (response && response.success) {
      console.log("Upload Response Data:", response);
      navigate(`/project/${response.projectId}`, {
        state: { filenames_list: response.bvh_filenames }
      });
    } else {
      console.error("Upload Error:", response);
    }
  };

  return (
    <div className="flex sm:flex-row flex-col-reverse justify-between items-center gap-y-8 sm:gap-y-0">
      <UploadVideoSection
        handleUpload={handleUpload}
        handleFileChange={handleFileChange}
        progress={progress}
        loading={loading}
        file={file}
      />

      <UploadVideoSettingsSection
        settings={settings}
        setSettings={setSettings}
        error={settingsError}
        loading={loading}
      />

    </div>
  );
};

export default UploadPage;
