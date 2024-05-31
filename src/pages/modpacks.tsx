"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image from next/image

const ModpackSkeleton = () => (
  <div className="h-[90px] w-full animate-pulse flex-col overflow-hidden rounded-lg bg-gray-800 shadow-lg"></div>
);

type Modpack = {
  isInVersions: boolean;
  id: string;
  name: string;
  version: string;
  status: string;
  author: string;
  displayName: string;
  downloads: number;
  icon: string;
  mem_min: number;
  platformUrl: string;
  provider: string;
  provider_icon: string;
  provider_id: string;
  release: string;
  slug: string;
  summary: string;
  tags: string[];
  versions: string[] | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type VersionsData = {
  provider_id: string;
  versions: string[];
};

const ModpackItem = ({
  name,
  icon,
  status,
  tags,
  downloads,
  providerId,
  isInVersions,
  onUpdate,
}: {
  name: string;
  icon: string;
  version: string;
  status: string;
  tags: string[];
  downloads: number;
  providerId: string;
  isInVersions: boolean;
  onUpdate: () => void;
}) => (
  <Link href={`/modpacks/${providerId}`} passHref>
    <div className="block">
      <div className="relative flex cursor-pointer flex-col overflow-hidden rounded-lg shadow-lg">
        <Image
          src={icon}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          style={{ backdropFilter: "blur(5px)" }}
        ></div>
        <div className="relative flex flex-col justify-between p-4">
          {isInVersions && (
            <div className="absolute right-0 top-0 bg-red-600 p-1 text-xs text-white">
              New Version Available!
            </div>
          )}
          <h3 className="text-md truncate font-bold text-white">{name}</h3>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-sm text-gray-300">Downloads: {downloads}</p>
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`rounded px-2 py-1 text-xs text-white ${getTagColor(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>
          {status === "Needs Update" && (
            <button
              type="button"
              className="mt-2 rounded bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation(); // Prevent Link navigation
                e.preventDefault(); // Prevent default to ensure button doesn't trigger link navigation
                onUpdate();
              }}
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  </Link>
);

const getTagColor = (tag: string) => {
  switch (
    tag.toLowerCase() // Use toLowerCase() for case-insensitive matching
  ) {
    case "processed":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "bg-gray-500"; // Default color for tags without specific colors
  }
};

const Modpacks = () => {
  const [modpacks, setModpacks] = useState<Modpack[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(18);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [sortDescending, setSortDescending] = useState(true);

  useEffect(() => {
    const fetchOptions = {
      method: "GET",
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchOptions: RequestInit = {
          method: "GET",
          headers: {
            "x-api-key": process.env.API_KEY || "",
          },
        };

        const modpacksRes = fetch(
          "https://internalmodpackapi.sghlocal.com/api/v1/curated",
          fetchOptions
        );
        const versionsRes = fetch(
          "https://internalmodpackapi.sghlocal.com/api/v1/versions",
          fetchOptions
        );

        const [modpacksResponse, versionsResponse] = await Promise.all([
          modpacksRes,
          versionsRes,
        ]);

        if (!modpacksResponse.ok || !versionsResponse.ok) {
          throw new Error(
            `HTTP error! Status: ${modpacksResponse.status} or ${versionsResponse.status}`
          );
        }
        const modpacksData: ApiResponse<Modpack[]> =
          await (modpacksResponse.json() as Promise<ApiResponse<Modpack[]>>);
        const versionsData: ApiResponse<VersionsData[]> =
          await (versionsResponse.json() as Promise<
            ApiResponse<VersionsData[]>
          >);
        if (modpacksData.success && versionsData.success) {
          const versionsMap: Record<string, boolean> = versionsData.data.reduce(
            (acc: Record<string, boolean>, item: VersionsData) => {
              if (item.versions && item.versions.length > 0) {
                acc[item.provider_id] = true;
              }
              return acc;
            },
            {}
          );

          const updatedModpacks = modpacksData.data.map((modpack: Modpack) => {
            const isInVersions = versionsMap[modpack.provider_id] === true;
            return { ...modpack, isInVersions };
          });

          setModpacks(updatedModpacks);
          setTotalResults(updatedModpacks.length);
        } else {
          throw new Error("API response was not successful.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [currentPage]);

  const toggleSortOrder = () => {
    setSortDescending(!sortDescending);
  };

  const sortedModpacks = [...modpacks].sort((a, b) => {
    return sortDescending
      ? b.downloads - a.downloads
      : a.downloads - b.downloads;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedModpacks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            All Modpacks{" "}
            <span className="text-sm text-gray-400">
              ({totalResults} results)
            </span>
          </h2>
          <span>
            <button
              onClick={toggleSortOrder}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              {sortDescending ? "Sort by Popularity" : "Sort by Downloads"}
            </button>
          </span>
        </div>

        <div className="mb-3 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 18 }).map((_, index) => (
                <ModpackSkeleton key={index} />
              ))
            : currentItems.map((modpack) => (
                <ModpackItem
                  key={modpack.provider_id}
                  name={modpack.displayName}
                  icon={modpack.icon}
                  status={modpack.status}
                  tags={modpack.tags}
                  downloads={modpack.downloads}
                  providerId={modpack.provider_id}
                  isInVersions={modpack.isInVersions}
                  onUpdate={() => console.log("Update functionality here")}
                  version={modpack.version}
                />
              ))}
        </div>
        <div className="flex items-center justify-center space-x-4 p-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors duration-200 ease-in-out hover:bg-blue-600 disabled:bg-gray-800"
          >
            Previous
          </button>

          <span className="text-sm font-semibold">
            Page {currentPage} of {Math.ceil(modpacks.length / itemsPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(modpacks.length / itemsPerPage)}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors duration-200 ease-in-out hover:bg-blue-600 disabled:bg-gray-800"
          >
            Next
          </button>
        </div>
      </section>
    </>
  );
};

export default Modpacks;
