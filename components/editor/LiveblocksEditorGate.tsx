import { useRoom } from "@liveblocks/react";
import { Loader } from "../ui/Loader";

export const LiveblocksEditorGate = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const room = useRoom();
  const connected = room.getStatus() === "connected";

  return (
    <div className="relative">
      {!connected && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
          <Loader />
        </div>
      )}
      {children}
    </div>
  );
};
