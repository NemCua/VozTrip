"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Flag = { key: string; enabled: boolean; label: string; updatedAt: string };

const GROUP_LABELS: Record<string, string> = {
  "app":    "Ứng dụng",
  "guest":  "Tính năng khách",
  "seller": "Tính năng seller",
  "admin":  "Tính năng admin",
  "other":  "Khác",
};

const GROUP_ORDER = ["app", "guest", "seller", "admin", "other"];

function groupKey(key: string) {
  if (key.startsWith("app."))    return "app";
  if (key.startsWith("guest."))  return "guest";
  if (key.startsWith("seller.")) return "seller";
  if (key.startsWith("admin."))  return "admin";
  return "other";
}

export default function AdminFeaturesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: flags = [], isLoading } = useQuery<Flag[]>({
    queryKey: ["admin-features"],
    queryFn: () => api.get("/api/admin/features", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.patch(`/api/admin/features/${encodeURIComponent(key)}`, { enabled }, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-features"] });
      // Re-render server components để FeaturesContext và sidebar cập nhật ngay
      router.refresh();
    },
  });

  const grouped = flags.reduce<Record<string, Flag[]>>((acc, f) => {
    const g = groupKey(f.key);
    (acc[g] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Cấu hình</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          Feature Flags
        </h1>
        <p className="text-xs mt-1" style={{ color: "#8c7a5e" }}>
          Thay đổi có hiệu lực ngay lập tức — không cần deploy lại.
        </p>
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {GROUP_ORDER.filter(g => grouped[g]?.length).map(group => (
            <div key={group}>
              <div className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#b09878" }}>
                {GROUP_LABELS[group] ?? group}
              </div>
              <div style={{ border: "1px solid #e8dfc8", borderRadius: "2px", overflow: "hidden" }}>
                {grouped[group].map((flag, i) => (
                  <div
                    key={flag.key}
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fdfaf4" : "#faf7f0",
                      borderBottom: i < grouped[group].length - 1 ? "1px solid #e8dfc8" : "none",
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm" style={{ color: "#2c2416" }}>{flag.label}</span>
                      <span className="text-xs font-mono" style={{ color: "#b09878" }}>{flag.key}</span>
                    </div>

                    {/* Toggle switch */}
                    <button
                      onClick={() => toggleMutation.mutate({ key: flag.key, enabled: !flag.enabled })}
                      disabled={toggleMutation.isPending}
                      className="relative flex-shrink-0 transition-opacity disabled:opacity-50"
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        backgroundColor: flag.enabled ? "#2c7a3c" : "#d1c4b0",
                        border: "none", cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      title={flag.enabled ? "Bật — click để tắt" : "Tắt — click để bật"}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 3, left: flag.enabled ? 23 : 3,
                          width: 18, height: 18, borderRadius: "50%",
                          backgroundColor: "#fff",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-6" style={{ color: "#b09878" }}>
        Thay đổi có hiệu lực ngay lập tức trên web. Mobile app cập nhật khi khởi động lại.
      </p>
    </div>
  );
}
