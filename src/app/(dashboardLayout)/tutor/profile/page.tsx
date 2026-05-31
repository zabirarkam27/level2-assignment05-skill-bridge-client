"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Save, DollarSign } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ChangePassword from "@/components/ChangePassword";
import CategorySubjectPicker from "@/components/CategorySubjectPicker";

interface TutorProfile {
  bio: string;
  subjects: string[];
  price: number;
  image?: string;
}

export default function TutorProfilePage() {
  const [profile, setProfile] = useState<TutorProfile>({
    bio: "",
    subjects: [],
    price: 0,
    image: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/mentors/profile/me`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (data.data) {
          setProfile({
            bio: data.data.bio ?? "",
            subjects: data.data.subjects ?? [],
            price: data.data.price ?? 0,
            image: data.data.user?.image ?? "",
          });
        }
      } catch {
        /* no existing profile yet */
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors/profile`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bio: profile.bio,
            subjects: profile.subjects,
            price: profile.price,
          }),
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: profile.image }),
        }),
      ]).then(([profileRes, userRes]) => {
        if (!profileRes.ok || !userRes.ok) throw new Error("Failed");
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#611f69] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
          Tutor Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your public tutor profile
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5">
        <ImageUpload
          currentImage={profile.image}
          onUploadComplete={(url) => setProfile((p) => ({ ...p, image: url }))}
        />

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Bio
          </label>
          <Textarea
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell students about yourself, your teaching style, experience..."
            rows={4}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Hourly Rate (৳)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="number"
              value={profile.price}
              onChange={(e) => setProfile((p) => ({ ...p, price: Number(e.target.value) }))}
              className="pl-9"
              placeholder="100"
              min={100}
            />
          </div>
        </div>

        {/* Subjects */}
        <CategorySubjectPicker
          value={profile.subjects}
          onChange={(subjects) => setProfile((p) => ({ ...p, subjects }))}
        />

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
        >
          {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
        </Button>
      </div>

      <ChangePassword />
    </div>
  );
}
