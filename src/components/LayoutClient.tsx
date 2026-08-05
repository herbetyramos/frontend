"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";


export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Header
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
      />

      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <main
        className="
          pt-14
          p-4
          min-h-screen
          overflow-y-auto
        "
      >
        {children}
      </main>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}