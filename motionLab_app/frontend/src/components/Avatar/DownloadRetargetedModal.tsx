import { serverURL } from "@/api/config";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { X } from "lucide-react";
import AvatarModel from "@/components/Avatar/AvatarModel";

interface Props {
  filename: string;
  onClose: () => void;
}



const DownloadRetargetedModal: React.FC<Props> = ({ filename, onClose }) => {
  const downloadUrl = `${serverURL}/retargeted_avatars/${filename}`;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/90">
      <div className="relative bg-gray-800 px-6 py-4 border border-purple-500/20 rounded-lg w-full sm:w-[600px] max-w-[90vw] max-h-[95vh]">
        <div className="flex flex-row justify-center items-center mb-4 w-full">

          <h2 className="font-bold text-white text-xl text-center">🎉 Retargeting Complete</h2>
          <button
            onClick={onClose}
            className="right-4 absolute text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-black/50 p-4 border border-purple-500/10 rounded-lg">
            <div className="h-[300px]">
              <Canvas camera={{ position: [0, 1, 3], fov: 60 }}>
                <Environment preset="sunset" />

                {/* Add grid helper */}
                {/* @ts-expect-error */}
                <gridHelper args={[10, 10]} />

                {/* Model preview */}
                <AvatarModel url={downloadUrl} />

                <OrbitControls minDistance={1} maxDistance={10} target={[0, 0.75, 0]} />
              </Canvas>

            </div>
            <p className="mt-2 text-gray-400 text-sm text-center">
              Note: If you used high X or Y sensitivity, you may need to zoom out to view your avatar completely.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-black/50 p-4 border border-purple-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm text-center">
                ⚠️ This retargeted avatar will be automatically deleted in 15 minutes. Please download it now if you want to keep it.
              </p>
            </div>

            <a
              href={downloadUrl}
              download
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-md font-semibold text-white text-center transition-colors duration-200"
            >
              Download Retargeted Avatar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadRetargetedModal;
