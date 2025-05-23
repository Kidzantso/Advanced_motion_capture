import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import BVHViewer from "@components/BVH/BVHViewer";
import FormButton from "@/components/UI/FormButton";
import FormSelect from "@/components/UI/FormSelect";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import ErrorMessage from "@/components/UI/ErrorMessage";
import RetargetedAvatarsList from "@/components/Avatar/RetargetedAvatarsList";
import EmptyState from "@/components/UI/EmptyState";

import { getProjectBVHFilenames, getProjectById } from "@/api/projectAPIs";
import useUserStore from "@/store/useUserStore";

import { serverURL } from "@/api/config";
import { Eye, EyeOff, Plus } from "lucide-react";

import useProjectStore from "@/store/useProjectStore";
import useAvatarStore from "@/store/useAvatarStore";

import DownloadRetargetedModal from "@/components/Avatar/DownloadRetargetedModal";
import RetargetPreviewModal from "@/components/Avatar/RetargetPreviewModal";

const BVHScene: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadModalFilename, setDownloadModalFilename] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [retargeting, setRetargeting] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [bvhUrlList, setBvhUrlList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bvhVisibility, setBvhVisibility] = useState<boolean[]>([]);

  const [selectedBVH, setSelectedBVH] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const { createRetargetedAvatar } = useProjectStore();
  const { avatars, fetchAvatars } = useAvatarStore();

  const location = useLocation();
  const { projectId } = useParams();
  const { user } = useUserStore();

  const toggleVisibility = (index: number) => {
    setBvhVisibility((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchAvatars(user.id.toString());
  }, [user]);

  useEffect(() => {
    if (!projectId || !user?.id) return;

    const fetchProjectDetails = async () => {
      try {
        const response = await getProjectById(projectId, user.id.toString());
        if (response.success && response.data) {
          setProjectName(response.data.name);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId, user]);

  useEffect(() => {
    try {
      setLoading(true)
      if (location.state) {
        const state = location.state;
        const updatedUrls = state.filenames_list.map(
          (fileName: string) => `${serverURL}/bvh/${fileName}`
        );
        setBvhUrlList(updatedUrls);
        setBvhVisibility(new Array(updatedUrls.length).fill(true));
      } else {
        if (!projectId || !user?.id) return;

        getProjectBVHFilenames(projectId, user.id.toString()).then((response) => {
          if (response.success) {
            const updatedUrls = response.data.map(
              (fileName: string) => `${serverURL}/bvh/${fileName}`
            );
            setBvhUrlList(updatedUrls);
            setBvhVisibility(new Array(updatedUrls.length).fill(true));
          } else {
            console.error("Error fetching BVH filenames:", response.data);
          }
        });
      }
    }
    catch (error) {
      console.error("Error fetching BVH filenames:", error);
    }
    finally {
      setLoading(false);
    }
  }, [location.state, projectId, user]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleDurationScroll = (scrolling: boolean) => {
    setIsScrolling(scrolling);
  };

  const downloadBVHFiles = async () => {
    if (bvhUrlList.length === 1) {
      const url = bvhUrlList[0];
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}`);
        }
        const blob = await response.blob();
        const filename = url.substring(url.lastIndexOf("/") + 1);
        saveAs(blob, filename);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    } else {
      const zip = new JSZip();
      await Promise.all(
        bvhUrlList.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}`);
            }
            const blob = await response.blob();
            const filename = url.substring(url.lastIndexOf("/") + 1);
            zip.file(filename, blob);
          } catch (error) {
            console.error("Error downloading file:", error);
          }
        })
      );
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "BVHFiles.zip");
      });
    }
  };

  const handleRetargetClick = () => {
    if (!projectId || !user?.id || !selectedBVH || !selectedAvatarId) {
      setErrorMessage("Select BVH & Avatar");
      return;
    }
    setErrorMessage(null);
    setShowPreviewModal(true);
  };

  const handleConfirmRetarget = async () => {
    if (!projectId || !user?.id || !selectedBVH || !selectedAvatarId) return;

    try {
      setRetargeting(true);
      const res = await createRetargetedAvatar(projectId, user.id.toString(), selectedBVH, selectedAvatarId);
      if (res.success) {
        setShowPreviewModal(false);
        // @ts-expect-error
        setDownloadModalFilename(res.filename);
      } else {
        alert("❌ Failed to create retargeted avatar.");
      }
    } catch (err) {
      console.error("Error during retargeting:", err);
      alert("❌ An unexpected error occurred.");
    } finally {
      setRetargeting(false);
    }
  };

  const handleCancelRetarget = () => {
    setShowPreviewModal(false);
  };

  const handleCreateAvatar = () => {
    navigate('/avatar/create');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-[40vh]">
        <LoadingSpinner size={125} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8 px-4 w-full">
        {projectName && (
          <h1 className="font-bold text-white text-3xl">{projectName}</h1>
        )}
        <div className="flex flex-row items-center gap-y-8 w-full">
          <div className="flex sm:flex-row flex-col gap-8 w-full">
            <div className="bg-black/50 p-6 rounded-xl w-full sm:w-3/4">
              <h2 className="mb-4 text-white text-2xl">BVH Viewer</h2>
              <div className="w-full h-[60vh]">
                <Canvas camera={{ position: [0, 75, 150], fov: 60 }}>
                  <OrbitControls />
                  {bvhUrlList.map((url, index) => (
                    <BVHViewer
                      key={url}
                      bvhUrl={url}
                      isPlaying={isPlaying}
                      currentTime={currentTime}
                      onDurationSet={setDuration}
                      onTimeUpdate={setCurrentTime}
                      isScrolling={isScrolling}
                      visible={bvhVisibility[index]} // ← always mounted, toggle visibility
                    />
                  ))}

                </Canvas>
              </div>
            </div>

            <div className="bg-black/50 p-6 rounded-xl w-full sm:w-1/4">
              <h2 className="mb-4 text-white text-2xl">Controls</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {bvhUrlList.map((_, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1  px-2 py-1 border border-purple-600 rounded-md text-white ${bvhVisibility[index] ? "bg-black/50" : "bg-gray-600 text-white/50"}`}
                    >
                      BVH {index + 1}
                      <button onClick={() => toggleVisibility(index)} className="hover:text-purple-600 cursor-pointer">
                        {bvhVisibility[index] ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
                <h1 className="font-bold text-white text-center">Animation Controls</h1>

                <div className="flex flex-col items-center gap-y-4 w-full">
                  <FormButton
                    label={isPlaying ? "Pause" : "Play"}
                    className="z-10 p-2 rounded-md max-w-min text-white"
                    onClick={togglePlayPause}
                    disabled={bvhUrlList.length === 0}
                  />

                  {bvhUrlList.length === 0 && (
                    <p className="text-red-500 text-sm">No BVH files available.</p>
                  )}

                  <div className="z-10 w-full">
                    <input
                      type="range"
                      min="0"
                      max={duration.toString()}
                      step="0.01"
                      value={currentTime}
                      onChange={handleTimeChange}
                      onMouseDown={() => handleDurationScroll(true)}
                      onMouseUp={() => handleDurationScroll(false)}
                      onTouchStart={() => handleDurationScroll(true)}
                      onTouchEnd={() => handleDurationScroll(false)}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-white text-sm">
                      <span>{currentTime.toFixed(2)}s</span>
                      <span>{duration.toFixed(2)}s</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 px-4 w-full">
                    {avatars.length > 0 ? (
                      <div className="flex flex-col justify-center items-center gap-4 w-full">
                        <FormSelect
                          label="BVH Animation"
                          value={selectedBVH ?? ""}
                          onChange={(value) => setSelectedBVH(value)}
                          options={bvhUrlList.map((url, index) => ({
                            value: url.split("/").pop() ?? "",
                            label: `BVH ${index + 1}`
                          }))}
                          placeholder="Select BVH"
                        />

                        <FormSelect
                          label="Avatar"
                          value={selectedAvatarId ?? ""}
                          onChange={(value) => setSelectedAvatarId(value)}
                          options={avatars.map((avatar) => ({
                            value: avatar.id.toString(),
                            label: avatar.name
                          }))}
                          placeholder="Select Avatar"
                        />

                        {errorMessage && <ErrorMessage message={errorMessage} />}
                        <FormButton
                          label={retargeting ? "Retargeting..." : "Retarget Avatar"}
                          loading={retargeting}
                          onClick={handleRetargetClick}
                          disabled={retargeting}
                          fullWidth={false}
                          extraStyles="border border-purple-600"
                          theme="dark"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center gap-4">
                        <EmptyState
                          title="No Avatars Available"
                          description="You need to create an avatar before you can retarget your BVH files."
                          className="max-w-full"
                        />
                        <FormButton
                          label={
                            <div className="flex justify-center items-center gap-2">
                              <Plus size={20} />
                              <span>Create Avatar</span>
                            </div>
                          }
                          theme="dark"
                          fullWidth={false}
                          extraStyles="border border-purple-600"
                          onClick={handleCreateAvatar}
                        />
                      </div>
                    )}
                  </div>

                  <FormButton
                    label="Download BVH File(s)"
                    className="z-10 rounded-md max-w-min text-white whitespace-nowrap"
                    onClick={downloadBVHFiles}
                    disabled={bvhUrlList.length === 0}
                    theme="dark"
                    extraStyles="border border-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-12 px-4 w-full">
        <RetargetedAvatarsList />
      </div>
      {showPreviewModal && selectedAvatarId && (
        <RetargetPreviewModal
          modelSrc={`${serverURL}/avatars/${avatars.find(a => a.id.toString() === selectedAvatarId.toString())?.filename}`}
          characterName={avatars.find(a => a.id.toString() === selectedAvatarId.toString())?.name || ""}
          onConfirm={handleConfirmRetarget}
          onCancel={handleCancelRetarget}
          loading={retargeting}
        />
      )}

      {downloadModalFilename && (
        <DownloadRetargetedModal
          filename={downloadModalFilename}
          onClose={() => setDownloadModalFilename(null)}
        />
      )}
    </>
  );
};

export default BVHScene;