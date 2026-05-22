export type ImageUploadPreset = "avatar" | "course" | "category" | "general";

export interface OptimizedUploadResult {
  url: string;
  format: "avif" | "webp";
  width: number;
  height: number;
}

const CLIENT_PRESETS: Record<
  ImageUploadPreset,
  { maxWidth: number; maxHeight: number; quality: number }
> = {
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.82 },
  course: { maxWidth: 1200, maxHeight: 800, quality: 0.78 },
  category: { maxWidth: 900, maxHeight: 506, quality: 0.76 },
  general: { maxWidth: 1400, maxHeight: 1000, quality: 0.78 },
};

async function compressImageBeforeUpload(
  file: File,
  preset: ImageUploadPreset,
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const { maxWidth, maxHeight, quality } = CLIENT_PRESETS[preset];
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (!blob || blob.size >= file.size) return file;

    const filename = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${filename}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadOptimizedImage(
  file: File,
  preset: ImageUploadPreset = "general",
): Promise<OptimizedUploadResult> {
  const uploadFile = await compressImageBeforeUpload(file, preset);
  const formData = new FormData();
  formData.append("image", uploadFile);
  formData.append("preset", preset);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Upload failed");
  }

  return data.data as OptimizedUploadResult;
}

export async function uploadOptimizedImageFromUrl(
  url: string,
  preset: ImageUploadPreset = "general",
): Promise<OptimizedUploadResult> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/upload/image/from-url`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, preset }),
    },
  );

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Upload failed");
  }

  return data.data as OptimizedUploadResult;
}
