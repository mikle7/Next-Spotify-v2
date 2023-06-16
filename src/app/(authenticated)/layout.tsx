import Header from "@/components/Header";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import Sidebar from "@/components/Sidebar";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { getAuthSession } from "@/utils/serverUtils";
import { redirect } from "next/navigation";
import TrackPlayerProvider from "@/providers/TrackPlayerProvider";
import PreviewPlayer from "@/components/PreviewPlayer";

const fontFamily = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <TrackPlayerProvider>
          <body className={fontFamily.className + " text-white bg-background"}>
            <Sidebar />
            <div className="flex flex-col ml-64">
              <Header />
              <main className="mx-8 my-4">{children}</main>
            </div>
            <PreviewPlayer />
          </body>
        </TrackPlayerProvider>
      </NextAuthProvider>
    </html>
  );
}