"use client";

import { useEffect, useState } from "react";
import { AppUser } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Search, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

function DeleteDialog({
  user,
  onDelete,
  isDeleting,
}: {
  user: AppUser;
  onDelete: (id: string, close: () => void) => Promise<void>;
  isDeleting: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <b>{user.name}</b>? This action
            cannot be undone and all associated data will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => onDelete(user.id, () => setOpen(false))}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        { credentials: "include" },
      );
      const data = await res.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBan = async (userId: string, currentStatus: string) => {
    setUpdating(userId);
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) throw new Error();
      setUsers((u) =>
        u.map((usr) =>
          usr.id === userId ? { ...usr, status: newStatus as "ACTIVE" | "BANNED" } : usr,
        ),
      );
      toast.success(`User ${newStatus === "BANNED" ? "banned" : "unbanned"} successfully`);
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: string, closeDialog: () => void) => {
    setUpdating(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setUsers((u) => u.filter((usr) => usr.id !== userId));
      closeDialog();
      toast.success("User removed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  console.log(users);
  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
              Manage Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {users.length} total users
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40 w-56"
            />
          </div>
          <Button asChild className="bg-[#611f69] hover:bg-[#4a174f] text-white dark:bg-[#c084fc] dark:text-black">
            <Link href="/admin/users/mentors">
              <UserPlus className="w-4 h-4 mr-2" /> Manage Mentors
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-48 bg-gray-100 dark:bg-gray-600 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              filtered.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image src={user.image||"/avatar.svg"} alt={user.name} width={40} height={40} className="object-cover w-full h-full" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Role */}
                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "default"
                        : user.role === "TUTOR"
                          ? "secondary"
                          : "outline"
                    }
                    className="hidden sm:flex"
                  >
                    {user.role}
                  </Badge>

                  {/* Status */}
                  <Badge variant={user.status === "BANNED" ? "destructive" : "success"}>
                    {user.status || "ACTIVE"}
                  </Badge>

                  {/* Actions */}
                  {user.role !== "ADMIN" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === user.id}
                        onClick={() => toggleBan(user.id, user.status || "ACTIVE")}
                        className={`text-xs h-8 ${user.status === "BANNED"
                          ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          : "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                      >
                        {updating === user.id ? "..." : user.status === "BANNED" ? (
                          <><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Unban</>
                        ) : (
                          <><ShieldOff className="w-3.5 h-3.5 mr-1" /> Ban</>
                        )}
                      </Button>

                      {/* Delete Dialog */}
                      <DeleteDialog
                        user={user}
                        onDelete={handleDelete}
                        isDeleting={updating === user.id}
                      />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
