export type ImageUploadPreset = "avatar" | "course" | "category" | "general";

export interface OptimizedUploadResult {
  url: string;
  format: "avif" | "webp";
  width: number;
  height: number;
}

export async function uploadOptimizedImage(
  file: File,
  preset: ImageUploadPreset = "general",
): Promise<OptimizedUploadResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("preset", preset);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

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
