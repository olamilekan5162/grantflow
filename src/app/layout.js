import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientOnboarding from "@/components/ClientOnboarding";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GrantFlow – Transparent Funding for Public Goods",
  description:
    "See exactly where every dollar goes. Get paid instantly when work is done.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-slate-800 antialiased">
        <AppProvider>
          <Navigation />
          <ClientOnboarding />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
