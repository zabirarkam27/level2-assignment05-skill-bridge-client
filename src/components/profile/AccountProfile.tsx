"use client";

import { useEffect, useState } from "react";
import { Save, User } from "lucide-react";
import { toast } from "sonner";
import { useSessionContext } from "@/context/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ImageUpload";
import ChangePassword from "@/components/ChangePassword";

type AccountProfileProps = {
  title?: string;
  description?: string;
};

export default function AccountProfile({
  title = "My Profile",
  description = "Update your personal information",
}: AccountProfileProps) {
  const { user, refetch } = useSessionContext();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, image }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      await refetch();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <User className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ImageUpload
          currentImage={image}
          onUploadComplete={(url) => setImage(url)}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <Input id="profile-email" value={user?.email || ""} disabled className="opacity-60" />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div>
            <label
              htmlFor="profile-role"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Role
            </label>
            <div id="profile-role" className="flex h-10 items-center rounded-md border border-input bg-gray-50 px-3 text-sm capitalize opacity-60 dark:bg-gray-700">
              {user?.role?.toLowerCase()}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <ChangePassword />
    </div>
  );
}
