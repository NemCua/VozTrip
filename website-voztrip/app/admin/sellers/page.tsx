"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type CreateSellerForm = {
  username: string;
  password: string;
  shopName: string;
  fullName: string;
  email: string;
  contactPhone: string;
  description: string;
};

type Seller = {
  sellerId: string;
  username: string;
  fullName: string | null;
  email: string | null;
  shopName: string;
  contactPhone: string | null;
  description: string | null;
  isActive: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
};

export default function SellersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSellerForm>({
    username: "", password: "", shopName: "",
    fullName: "", email: "", contactPhone: "", description: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: sellers = [], isLoading } = useQuery<Seller[]>({
    queryKey: ["admin-sellers"],
    queryFn: async () => {
      const res = await api.get("/api/admin/sellers", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken,
  });

  const approveMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await api.put(`/api/admin/sellers/${sellerId}/approve`, null, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sellers"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (form: CreateSellerForm) => {
      const res = await api.post("/api/admin/sellers", form, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      setShowCreate(false);
      setCreateForm({ username: "", password: "", shopName: "", fullName: "", email: "", contactPhone: "", description: "" });
      setCreateError(null);
    },
    onError: (e: any) => setCreateError(e?.response?.data?.message ?? "Lỗi tạo seller"),
  });

  const toggleMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await api.put(`/api/admin/users/${sellerId}/toggle`, null, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sellers"] }),
  });

  const pending = sellers.filter(s => !s.approvedAt);
  const all = sellers;
  const displayed = tab === "pending" ? pending : all;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Management</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Sellers</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
          style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
          onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
          onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
        >
          + Create Seller
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 gap-0" style={{ borderBottom: "1px solid #d8cbb0" }}>
        {([["pending", `Pending (${pending.length})`], ["all", `All (${all.length})`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-5 py-2 text-xs tracking-widest uppercase transition-all"
            style={{
              borderBottom: tab === key ? "2px solid #c8a96e" : "2px solid transparent",
              color: tab === key ? "#2c2416" : "#8c7a5e",
              marginBottom: "-1px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : displayed.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          {tab === "pending" ? "No pending sellers" : "No sellers yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(seller => (
            <div
              key={seller.sellerId}
              className="px-5 py-4 flex items-center gap-4"
              style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium" style={{ color: "#2c2416" }}>{seller.shopName}</span>
                  {!seller.approvedAt && (
                    <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "2px" }}>
                      Pending
                    </span>
                  )}
                  {seller.approvedAt && !seller.isActive && (
                    <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "2px" }}>
                      Locked
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: "#8c7a5e" }}>
                  @{seller.username}
                  {seller.fullName && ` · ${seller.fullName}`}
                  {seller.email && ` · ${seller.email}`}
                  {seller.contactPhone && ` · ${seller.contactPhone}`}
                </div>
                {seller.description && (
                  <div className="text-xs mt-1 truncate" style={{ color: "#b09878" }}>{seller.description}</div>
                )}
                <div className="text-xs mt-1" style={{ color: "#c8b898" }}>
                  Registered: {new Date(seller.createdAt).toLocaleDateString("vi-VN")}
                  {seller.approvedAt && ` · Approved: ${new Date(seller.approvedAt).toLocaleDateString("vi-VN")} by ${seller.approvedBy}`}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!seller.approvedAt && (
                  <button
                    onClick={() => approveMutation.mutate(seller.sellerId)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                    style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
                    onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
                  >
                    Approve
                  </button>
                )}
                {seller.approvedAt && (
                  <button
                    onClick={() => toggleMutation.mutate(seller.sellerId)}
                    disabled={toggleMutation.isPending}
                    className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                    style={{
                      border: `1px solid ${seller.isActive ? "#d8cbb0" : "#c8a96e"}`,
                      color: seller.isActive ? "#8c7a5e" : "#c8a96e",
                      borderRadius: "1px",
                    }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = seller.isActive ? "#d8cbb0" : "#c8a96e"; (e.target as HTMLElement).style.color = seller.isActive ? "#8c7a5e" : "#c8a96e"; }}
                  >
                    {seller.isActive ? "Lock" : "Unlock"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Seller modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-8 w-full max-w-md" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Create Seller</h2>
              <button onClick={() => { setShowCreate(false); setCreateError(null); }} style={{ color: "#8c7a5e" }}>✕</button>
            </div>

            <div className="space-y-3">
              {[
                { key: "username", label: "Username *", type: "text" },
                { key: "password", label: "Password *", type: "password" },
                { key: "shopName", label: "Shop Name *", type: "text" },
                { key: "fullName", label: "Full Name", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "contactPhone", label: "Phone", type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs tracking-widest uppercase block mb-1" style={{ color: "#8c7a5e" }}>{label}</label>
                  <input
                    type={type}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                    value={(createForm as any)[key]}
                    onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs tracking-widest uppercase block mb-1" style={{ color: "#8c7a5e" }}>Description</label>
                <textarea
                  className="w-full px-3 py-2 text-sm outline-none resize-none"
                  rows={2}
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {createError && (
              <div className="mt-3 text-xs px-3 py-2" style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "2px" }}>
                {createError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.username || !createForm.password || !createForm.shopName}
                className="flex-1 py-2 text-xs tracking-widest uppercase transition-all"
                style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: (!createForm.username || !createForm.password || !createForm.shopName) ? 0.5 : 1 }}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="flex-1 py-2 text-xs tracking-widest uppercase"
                style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
