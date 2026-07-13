"use client";

import { useEffect, useMemo, useState } from "react";
import { AppUser } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  UserCheck,
  UserX,
  Clock,
  BookOpen,
  DollarSign,
  Plus,
  Copy,
  Check,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/avatar";
import CategorySubjectPicker from "@/components/CategorySubjectPicker";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";
import {
  DataListControls,
  SortDirection,
} from "@/components/data-list/DataListControls";
import { compareValues, paginateItems } from "@/lib/data-list";

const emptyForm = {
  name: "",
  email: "",
  bio: "",
  subjects: [] as string[],
  price: "",
};

const tutorSortOptions = [
  { label: "Applied Date", value: "createdAt" },
  { label: "Name", value: "name" },
  { label: "Email", value: "email" },
  { label: "Price", value: "price" },
];

export default function AdminTutorRequestsPage() {
  const [tutors, setTutors] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "approve" | "reject";
    tutor: AppUser;
  } | null>(null);

  // create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // password reveal dialog
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPending = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tutors/pending`,
        { credentials: "include" },
      );
      const data = await res.json();
      setTutors(Array.isArray(data.data) ? data.data : []);
    } catch {
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDirection, pageSize]);

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tutors;

    return tutors.filter((tutor) =>
      [
        tutor.name,
        tutor.email,
        tutor.tutorProfile?.bio,
        ...(tutor.tutorProfile?.subjects ?? []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [tutors, search]);

  const sortedTutors = useMemo(
    () =>
      [...filteredTutors].sort((first, second) => {
        const getValue = (tutor: AppUser) => {
          if (sortBy === "name") return tutor.name;
          if (sortBy === "email") return tutor.email;
          if (sortBy === "price") return tutor.tutorProfile?.price ?? 0;
          return new Date(tutor.createdAt ?? 0);
        };

        return compareValues(getValue(first), getValue(second), sortDirection);
      }),
    [filteredTutors, sortBy, sortDirection],
  );
  const paginatedTutors = useMemo(
    () => paginateItems(sortedTutors, page, pageSize),
    [sortedTutors, page, pageSize],
  );

  const handleApprove = async (userId: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tutors/${userId}/approve`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) throw new Error();
      setTutors((prev) => prev.filter((t) => t.id !== userId));
      setPendingAction(null);
      toast.success("Tutor approved successfully");
    } catch {
      toast.error("Failed to approve tutor");
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (userId: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tutors/${userId}/reject`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) throw new Error();
      setTutors((prev) => prev.filter((t) => t.id !== userId));
      setPendingAction(null);
      toast.success("Tutor application rejected");
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setUpdating(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.bio || form.subjects.length === 0 || !form.price) {
      toast.error("Please fill in all fields");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/create-mentor`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            bio: form.bio,
            subjects: form.subjects,
            price: Number(form.price),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create tutor");
      setCreateOpen(false);
      setForm(emptyForm);
      setGeneratedPassword(data.data.generatedPassword);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create tutor");
    } finally {
      setCreating(false);
    }
  };

  const copyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            Tutor Requests
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {loading ? "Loading…" : `${tutors.length} pending application${tutors.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#611f69] hover:bg-[#4a174f] text-white dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
        >
          <Plus className="w-4 h-4 mr-2" /> Create New Tutor
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter tutor requests..."
            className="pl-9"
          />
        </div>
        {!loading && (
          <DataListControls
            totalItems={sortedTutors.length}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDirection={sortDirection}
            sortOptions={tutorSortOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
          />
        )}
      </div>

      {/* Pending list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-56 bg-gray-100 dark:bg-gray-600 rounded" />
                  <div className="h-3 w-72 bg-gray-100 dark:bg-gray-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedTutors.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No pending tutor applications</p>
            <p className="text-xs mt-1 opacity-70">New requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedTutors.map((tutor, i) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:flex-row sm:items-start sm:px-5"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <Image src={getAvatarUrl(tutor.image)} alt={tutor.name} width={40} height={40} className="object-cover w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{tutor.name}</p>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
                      PENDING
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tutor.email}</p>

                  {tutor.tutorProfile && (
                    <div className="mt-2 space-y-1">
                      {tutor.tutorProfile.bio && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {tutor.tutorProfile.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {tutor.tutorProfile.subjects?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {tutor.tutorProfile.subjects.slice(0, 3).join(", ")}
                            {tutor.tutorProfile.subjects.length > 3 && ` +${tutor.tutorProfile.subjects.length - 3}`}
                          </span>
                        )}
                        {tutor.tutorProfile.price != null && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${tutor.tutorProfile.price}/hr
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {tutor.createdAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      Applied {new Date(tutor.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                  <Button
                    size="sm"
                    disabled={updating === tutor.id}
                    onClick={() =>
                      setPendingAction({ type: "approve", tutor })
                    }
                    className="h-8 flex-1 bg-green-600 text-xs text-white hover:bg-green-700 sm:flex-none"
                  >
                    {updating === tutor.id ? "…" : <><UserCheck className="w-3.5 h-3.5 mr-1" />Approve</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === tutor.id}
                    onClick={() => setPendingAction({ type: "reject", tutor })}
                    className="h-8 flex-1 border-red-400 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 sm:flex-none"
                  >
                    {updating === tutor.id ? "…" : <><UserX className="w-3.5 h-3.5 mr-1" />Reject</>}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tutor Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Tutor</DialogTitle>
            <DialogDescription>
              The account is created immediately as active. A temporary password will be generated — share it with the tutor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <Input
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <Textarea
                placeholder="Professional background and what they teach…"
                rows={3}
                className="resize-none"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CategorySubjectPicker
                value={form.subjects}
                onChange={(subjects) => setForm((f) => ({ ...f, subjects }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Price (৳)</label>
                <Input
                  type="number"
                  placeholder="100"
                  min={100}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={creating || !form.name || !form.email || !form.bio || form.subjects.length === 0 || !form.price}
              onClick={handleCreate}
              className="bg-[#611f69] hover:bg-[#4a174f] text-white dark:bg-[#c084fc] dark:text-black"
            >
              {creating ? "Creating…" : "Create Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={
          pendingAction?.type === "approve"
            ? "Approve tutor application?"
            : "Reject tutor application?"
        }
        description={
          <>
            {pendingAction?.type === "approve" ? "Approve" : "Reject"}{" "}
            <strong>{pendingAction?.tutor.name}</strong>&apos;s tutor
            application?
          </>
        }
        confirmText={pendingAction?.type === "approve" ? "Approve" : "Reject"}
        danger={pendingAction?.type === "reject"}
        loading={!!pendingAction && updating === pendingAction.tutor.id}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.type === "approve") {
            handleApprove(pendingAction.tutor.id);
          } else {
            handleReject(pendingAction.tutor.id);
          }
        }}
      />

      {/* Generated Password Dialog */}
      <Dialog open={!!generatedPassword} onOpenChange={() => setGeneratedPassword(null)}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle>Tutor Account Created</DialogTitle>
            <DialogDescription>
              Share this temporary password with the tutor. They can change it after logging in.
            </DialogDescription>
          </DialogHeader>

          <div
            className="my-2 px-5 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-[#611f69]/30 dark:border-[#c084fc]/30 cursor-pointer select-all"
            onClick={copyPassword}
          >
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Temporary Password</p>
            <p className="break-all font-mono text-xl font-bold tracking-tight text-[#611f69] dark:text-[#c084fc] sm:text-2xl">
              {generatedPassword}
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" onClick={copyPassword} className="w-full">
              {copied ? <><Check className="w-4 h-4 mr-2 text-green-500" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Password</>}
            </Button>
            <Button
              type="button"
              onClick={() => setGeneratedPassword(null)}
              className="w-full bg-[#611f69] hover:bg-[#4a174f] text-white dark:bg-[#c084fc] dark:text-black"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
