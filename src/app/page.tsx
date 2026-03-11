"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      router.replace("/api/auth/exchange");
    }, 5000); // 5 second timeout

    // Check if user is authenticated
    const controller = new AbortController();
    
    fetch("/api/auth/session", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        if (data.success && data.data?.user) {
          // User is logged in - fetch their first org/project/room
          fetch("/api/organizations", { signal: controller.signal })
            .then((res) => res.json())
            .then((orgData) => {
              if (orgData.success && orgData.data?.length > 0) {
                const org = orgData.data[0];
                // Get first project
                fetch(`/api/projects?organizationId=${org.id}`, { signal: controller.signal })
                  .then((res) => res.json())
                  .then((projData) => {
                    if (projData.success && projData.data?.length > 0) {
                      const project = projData.data[0];
                      // Get first room
                      fetch(`/api/projects/${project.id}/rooms`, { signal: controller.signal })
                        .then((res) => res.json())
                        .then((roomData) => {
                          if (roomData.success && roomData.data?.length > 0) {
                            const room = roomData.data[0];
                            router.replace(`/project/${project.id}/room/${room.id}/chat`);
                          } else {
                            setLoading(false);
                          }
                        })
                        .catch(() => setLoading(false));
                    } else {
                      setLoading(false);
                    }
                  })
                  .catch(() => setLoading(false));
              } else {
                setLoading(false);
              }
            })
            .catch(() => {
              setLoading(false);
            });
        } else {
          // Not logged in, redirect to sign in
          router.replace("/api/auth/exchange");
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        router.replace("/api/auth/exchange");
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
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
        <p className="text-gray-500">No projects found. Create your first project!</p>
      </div>
    </div>
  );
}
