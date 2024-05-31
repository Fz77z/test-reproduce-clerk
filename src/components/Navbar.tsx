"use client";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  return (
    <nav className="flex items-center justify-between rounded-lg bg-gray-800 p-4 text-white">
      <Link href="/dashboard">
        <div className="flex items-center space-x-2">
          {" "}
          <img
            src="/SimpleGameHostingIcon.png"
            alt="simplegamehostinglogo"
            className="h-14 w-14"
          />
          <span className="text-lg">Minecraft Modpacks Dashboard</span>
        </div>
      </Link>
      {isLoaded && user && (
        <>
          <div className="space-x-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
