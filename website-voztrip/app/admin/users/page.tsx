"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type AdminUser = {
  userId: string;
  username: string;
  fullName: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  isSeller: boolean;
  shopName: string | null;
  plan: string | null;
  approvedAt: string | null;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "seller" | "admin">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/api/admin/users", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: string) =>
      api.put(`/api/admin/users/${userId}/toggle`, null, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/admin/users/${userId}`, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmDelete(null);
    },
  });

  const filtered = users.filter(u => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.shopName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Management</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Users</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          className="px-3 py-2 text-sm outline-none"
          style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416", minWidth: "220px" }}
          placeholder="Search by username, name, email, shop..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex" style={{ border: "1px solid #d8cbb0", borderRadius: "2px" }}>
          {(["all", "seller", "admin"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setRoleFilter(opt)}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
              style={{
                backgroundColor: roleFilter === opt ? "#2c2416" : "#fdfaf4",
                color: roleFilter === opt ? "#f5f0e8" : "#8c7a5e",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <span className="text-xs ml-auto" style={{ color: "#8c7a5e" }}>
          {filtered.length} / {users.length} users
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          No users found
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column headers */}
          <div
            className="px-5 py-2 grid items-center text-xs tracking-widest uppercase"
            style={{ color: "#b09878", gridTemplateColumns: "1fr 1fr 80px 80px 160px" }}
          >
            <span>User</span>
            <span>Shop / Plan</span>
            <span>Role</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map(user => (
            <div
              key={user.userId}
              className="px-5 py-4 grid items-center gap-2"
              style={{
                backgroundColor: "#fdfaf4",
                border: "1px solid #e8dfc8",
                borderRadius: "2px",
                gridTemplateColumns: "1fr 1fr 80px 80px 160px",
                opacity: user.isActive ? 1 : 0.6,
              }}
            >
              {/* User info */}
              <div>
                <div className="text-sm font-medium" style={{ color: "#2c2416" }}>
                  @{user.username}
                  {user.fullName && <span className="font-normal ml-1" style={{ color: "#8c7a5e" }}>· {user.fullName}</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#b09878" }}>
                  {user.email ?? "—"}
                  <span className="ml-2" style={{ color: "#c8b898" }}>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Shop / Plan */}
              <div>
                {user.shopName ? (
                  <>
                    <div className="text-xs" style={{ color: "#2c2416" }}>{user.shopName}</div>
                    <span
                      className="inline-block text-xs px-2 py-0.5 mt-1"
                      style={{
                        backgroundColor: user.plan === "vip" ? "#fef3c7" : "#f5f5f5",
                        color: user.plan === "vip" ? "#92400e" : "#6b7280",
                        border: `1px solid ${user.plan === "vip" ? "#fde68a" : "#e5e7eb"}`,
                        borderRadius: "2px",
                      }}
                    >
                      {user.plan === "vip" ? "VIP" : "Free"}
                    </span>
                    {!user.approvedAt && (
                      <span
                        className="inline-block text-xs px-2 py-0.5 mt-1 ml-1"
                        style={{ backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "2px" }}
                      >
                        Pending
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs" style={{ color: "#b09878" }}>—</span>
                )}
              </div>

              {/* Role */}
              <div>
                <span
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: user.role === "admin" ? "#2c2416" : "#f0e8d8",
                    color: user.role === "admin" ? "#c8a96e" : "#8c7a5e",
                    borderRadius: "2px",
                  }}
                >
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div>
                <span
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: user.isActive ? "#f0fdf4" : "#fee2e2",
                    color: user.isActive ? "#16a34a" : "#991b1b",
                    border: `1px solid ${user.isActive ? "#bbf7d0" : "#fecaca"}`,
                    borderRadius: "2px",
                  }}
                >
                  {user.isActive ? "Active" : "Locked"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end">
                {user.role !== "admin" && (
                  <>
                    <button
                      onClick={() => toggleMutation.mutate(user.userId)}
                      disabled={toggleMutation.isPending}
                      className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all"
                      style={{
                        border: `1px solid ${user.isActive ? "#d8cbb0" : "#c8a96e"}`,
                        color: user.isActive ? "#8c7a5e" : "#c8a96e",
                        borderRadius: "1px",
                      }}
                    >
                      {user.isActive ? "Lock" : "Unlock"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(user.userId)}
                      className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all"
                      style={{ border: "1px solid #fecaca", color: "#dc2626", borderRadius: "1px" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (() => {
        const user = users.find(u => u.userId === confirmDelete);
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="p-8 w-full max-w-sm" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
              <div className="text-sm font-medium mb-2" style={{ color: "#2c2416" }}>Xóa tài khoản?</div>
              <div className="text-xs mb-6" style={{ color: "#8c7a5e" }}>
                Xóa <strong>@{user?.username}</strong> sẽ xóa toàn bộ dữ liệu liên quan (POIs, media...). Không thể hoàn tác.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(confirmDelete)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2 text-xs tracking-widest uppercase"
                  style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "1px" }}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
