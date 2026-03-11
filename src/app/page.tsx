"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          // User present (e.g. if auth is re-enabled) — go to first org/project/room
          fetch("/api/organizations", { signal: controller.signal })
            .then((res) => res.json())
            .then((orgData) => {
              if (orgData.success && orgData.data?.length > 0) {
                const org = orgData.data[0];
                return fetch(`/api/projects?organizationId=${org.id}`, { signal: controller.signal }).then((res) => res.json());
              }
              setLoading(false);
            })
            .then((projData) => {
              if (projData?.success && projData.data?.length > 0) {
                const project = projData.data[0];
                return fetch(`/api/projects/${project.id}/rooms`, { signal: controller.signal }).then((res) => res.json());
              }
              setLoading(false);
            })
            .then((roomData) => {
              if (roomData?.success && roomData.data?.length > 0) {
                const project = roomData.data[0].projectId ? { id: roomData.data[0].projectId } : null;
                const room = roomData.data[0];
                if (project) router.replace(`/project/${project.id}/room/${room.id}/chat`);
              }
              setLoading(false);
            })
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-500">No projects found. Create your first project from the sidebar.</p>
      </div>
    </div>
  );
}
