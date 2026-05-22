"use client";

import { useEffect, useState } from "react";
import { AppUser } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  UserPlus,
  ShieldCheck,
  Check,
  User,
  Mail,
  Wallet,
  BookMarked,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/avatar";
import CategorySubjectPicker from "@/components/CategorySubjectPicker";

export default function AdminMentorsPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [promoting, setpromoting] = useState(false);

  // Form states
  const [promoteForm, setPromoteForm] = useState({
    bio: "",
    subjects: [] as string[],
    price: 0,
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    bio: "",
    subjects: [] as string[],
    price: 0,
  });
  const [creating, setCreating] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async () => {
    if (!selectedUser) return;
    setpromoting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.id}/make-mentor`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...promoteForm,
            subjects: promoteForm.subjects,
          }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success(`${selectedUser.name} is now a Mentor!`);
      setShowPromoteDialog(false);
      setPromoteForm({ bio: "", subjects: [], price: 0 });
      fetchUsers();
    } catch {
      toast.error("Failed to promote user");
    } finally {
      setpromoting(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/create-mentor`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...createForm,
            subjects: createForm.subjects,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create mentor");

      toast.success("Mentor created successfully!");
      setGeneratedPassword(data.data.generatedPassword);
      setCreateForm({ name: "", email: "", bio: "", subjects: [], price: 0 });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create mentor");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.role === "STUDENT" &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#611f69] dark:text-[#c084fc]" />
          Mentors Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Promote existing users or create new professional mentors for the
          platform.
        </p>
      </div>

      <Tabs defaultValue="promote" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger value="promote" className="rounded-lg px-6">
            Promote Students
          </TabsTrigger>
          <TabsTrigger value="create" className="rounded-lg px-6">
            Create Fresh Mentor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promote" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search students to promote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No students found matching your search.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredUsers.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={getAvatarUrl(user.image)}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPromoteDialog(true);
                      }}
                      variant="outline"
                      className="border-[#611f69] text-[#611f69] dark:border-[#c084fc] dark:text-[#c084fc] hover:bg-[#611f69] hover:text-white rounded-lg"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Make Mentor
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#611f69] dark:text-[#c084fc]" />{" "}
              New Mentor Account
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400" /> Full Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" /> Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <BookMarked className="w-4 h-4 text-gray-400" /> Professional
                  Bio
                </label>
                <Textarea
                  placeholder="Tell us about their expertise, experience, and what they can teach..."
                  rows={4}
                  value={createForm.bio}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="resize-none"
                />
              </div>

              <div className="space-y-4">
                <CategorySubjectPicker
                  value={createForm.subjects}
                  onChange={(subjects) =>
                    setCreateForm((f) => ({ ...f, subjects }))
                  }
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Wallet className="w-4 h-4 text-gray-400" /> Hourly Price
                    ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={createForm.price || ""}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        price: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={
                  creating ||
                  !createForm.name ||
                  !createForm.email ||
                  !createForm.bio ||
                  createForm.subjects.length === 0 ||
                  !createForm.price
                }
                className="w-full h-12 bg-[#611f69] hover:bg-[#4a174f] text-white dark:bg-[#c084fc] dark:text-black rounded-xl text-lg font-semibold shadow-lg shadow-[#611f69]/20 transition-all active:scale-[0.98]"
              >
                {creating ? "Creating Account..." : "Generate Mentor Account"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Promotion Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Complete Mentor Profile</DialogTitle>
            <DialogDescription>
              Providing a bio and price is required for {selectedUser?.name} to
              appear as a Mentor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Professional Bio
              </label>
              <Textarea
                placeholder="Experience, background, etc..."
                value={promoteForm.bio}
                onChange={(e) =>
                  setPromoteForm((f) => ({ ...f, bio: e.target.value }))
                }
                className="resize-none"
              />
            </div>
            <div className="space-y-4">
              <div>
                <CategorySubjectPicker
                  value={promoteForm.subjects}
                  onChange={(subjects) =>
                    setPromoteForm((f) => ({ ...f, subjects }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hourly Price ($)
                </label>
                <Input
                  type="number"
                  value={promoteForm.price || ""}
                  onChange={(e) =>
                    setPromoteForm((f) => ({
                      ...f,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPromoteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              disabled={
                promoting ||
                !promoteForm.bio ||
                promoteForm.subjects.length === 0 ||
                !promoteForm.price
              }
              className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
            >
              {promoting ? "Promoting..." : "Confirm Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Result Dialog */}
      <Dialog
        open={!!generatedPassword}
        onOpenChange={() => setGeneratedPassword(null)}
      >
        <DialogContent className="text-center p-8 rounded-3xl">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Mentor Account Created!
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-500">
            Please share this auto-generated password with the mentor. They can
            change it after their first login.
          </DialogDescription>

          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-[#611f69]/30 dark:border-[#c084fc]/30 select-all transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50">
            <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-[0.2em] font-black">
              Temporary Password
            </p>
            <p className="text-4xl font-mono font-bold text-[#611f69] dark:text-[#c084fc] tracking-tight">
              {generatedPassword}
            </p>
          </div>

          <Button
            onClick={() => setGeneratedPassword(null)}
            className="mt-10 w-full h-12 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl font-bold shadow-xl transition-all hover:scale-[1.02]"
          >
            I&apos;ve copied the password
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
