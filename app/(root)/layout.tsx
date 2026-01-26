import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-tiptap/styles.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
};

export default Layout;
