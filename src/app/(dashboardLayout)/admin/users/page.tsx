"use client";

import { useEffect, useMemo, useState } from "react";
import { AppUser } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Users,
} from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import {
  DataListControls,
  SortDirection,
} from "@/components/data-list/DataListControls";
import { compareValues, paginateItems } from "@/lib/data-list";

type UserTab = "ALL" | "STUDENT" | "TUTOR";

const userTabs: { label: string; value: UserTab }[] = [
  { label: "All", value: "ALL" },
  { label: "Students", value: "STUDENT" },
  { label: "Tutors", value: "TUTOR" },
];

const userSortOptions = [
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Role", value: "role" },
  { label: "Status", value: "status" },
  { label: "Newest", value: "createdAt" },
];

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
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [activeTab, setActiveTab] = useState<UserTab>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [undoTarget, setUndoTarget] = useState<AppUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<AppUser | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, sortBy, sortDirection, pageSize]);

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
      setStatusTarget(null);
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

  const undoTutor = async (userId: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/undo-mentor`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed");

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: "STUDENT",
                status: "ACTIVE",
                tutorProfile: null,
              }
            : user,
        ),
      );
      toast.success("Tutor changed back to student");
      setUndoTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to undo tutor");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(
    () => users.filter((u) => {
      const matchesTab = activeTab === "ALL" || u.role === activeTab;
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    }),
    [users, activeTab, search],
  );

  const sortedUsers = useMemo(
    () =>
      [...filtered].sort((first, second) => {
        const getValue = (user: AppUser) => {
          if (sortBy === "name") return user.name;
          if (sortBy === "email") return user.email;
          if (sortBy === "role") return user.role;
          if (sortBy === "status") return user.status ?? "ACTIVE";
          return new Date(user.createdAt ?? 0);
        };

        return compareValues(getValue(first), getValue(second), sortDirection);
      }),
    [filtered, sortBy, sortDirection],
  );
  const paginatedUsers = useMemo(
    () => paginateItems(sortedUsers, page, pageSize),
    [sortedUsers, page, pageSize],
  );

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40 sm:w-56"
            />
          </div>
          <Button asChild className="w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black sm:w-auto">
            <Link href="/admin/users/mentors">
              <UserPlus className="w-4 h-4 mr-2" /> Manage Mentors
            </Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {userTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-[#611f69] bg-[#611f69] text-white dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-black"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <div className="mt-6">
          <DataListControls
            totalItems={sortedUsers.length}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortOptions={userSortOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
          />
        </div>
      )}

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
            {sortedUsers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              paginatedUsers.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={user.image||"/avatar.svg"} alt={user.name} width={40} height={40} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
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
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === user.id}
                        onClick={() => setStatusTarget(user)}
                        className={`h-8 flex-1 text-xs sm:flex-none ${user.status === "BANNED"
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

                      {user.role === "TUTOR" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updating === user.id}
                          onClick={() => setUndoTarget(user)}
                          className="h-8 flex-1 border-amber-400 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 sm:flex-none"
                        >
                          <GraduationCap className="mr-1 h-3.5 w-3.5" />
                          Undo Tutor
                        </Button>
                      )}

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
      <ConfirmActionDialog
        open={!!undoTarget}
        onOpenChange={(open) => !open && setUndoTarget(null)}
        title="Undo tutor role?"
        description={
          <>
            <strong>{undoTarget?.name}</strong> will become a student again.
            Assigned courses will no longer show this user as instructor.
          </>
        }
        confirmText="Undo Tutor"
        loading={!!undoTarget && updating === undoTarget.id}
        onConfirm={() => {
          if (undoTarget) undoTutor(undoTarget.id);
        }}
      />
      <ConfirmActionDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={
          statusTarget?.status === "BANNED"
            ? "Unban this user?"
            : "Ban this user?"
        }
        description={
          <>
            {statusTarget?.status === "BANNED" ? "Unban" : "Ban"}{" "}
            <strong>{statusTarget?.name}</strong>
            {statusTarget?.role === "TUTOR" &&
              statusTarget?.status !== "BANNED" &&
              ". Banned tutors will be hidden from the mentors list."}
          </>
        }
        confirmText={statusTarget?.status === "BANNED" ? "Unban" : "Ban"}
        danger={statusTarget?.status !== "BANNED"}
        loading={!!statusTarget && updating === statusTarget.id}
        onConfirm={() => {
          if (statusTarget) {
            toggleBan(statusTarget.id, statusTarget.status || "ACTIVE");
          }
        }}
      />
    </>
  );
}
