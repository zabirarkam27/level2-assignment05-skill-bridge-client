"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/avatar";
import { uploadOptimizedImage } from "@/lib/upload-image";

interface ImageUploadProps {
  currentImage: string | null | undefined;
  onUploadComplete: (url: string) => void;
}

export default function ImageUpload({
  currentImage,
  onUploadComplete,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadOptimizedImage(file, "avatar");
      onUploadComplete(result.url);
      toast.success(`Photo optimized (${result.format.toUpperCase()})`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayImage = preview || getAvatarUrl(currentImage);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#611f69]/20 dark:ring-[#c084fc]/20">
        <Image src={displayImage} alt="avatar" fill className="object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/heic"
        className="hidden"
        title="Upload avatar image"
        aria-label="Upload avatar image"
        onChange={handleFileSelect}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-xs"
      >
        <Camera className="w-3.5 h-3.5 mr-1.5" />
        {uploading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  );
}
