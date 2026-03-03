// import { supabase } from "@/integrations/supabase/client";

// export type Photo = {
//   id: string;
//   image_url: string;
//   storage_path: string;
//   created_at: string;
//   comments: Comment[];
// };

// export type Comment = {
//   id: string;
//   content: string;
//   photo_id: string;
//   created_at: string;
// };

// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
// const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// export function validateFile(file: File): string | null {
//   if (!ALLOWED_TYPES.includes(file.type)) {
//     return "Only JPG and PNG files are allowed.";
//   }
//   if (file.size > MAX_SIZE) {
//     return "File size must be under 5MB.";
//   }
//   return null;
// }

// export async function uploadPhoto(file: File) {
//   const ext = file.name.split(".").pop();
//   const path = `${crypto.randomUUID()}.${ext}`;

//   const { error: uploadError } = await supabase.storage
//     .from("photos")
//     .upload(path, file);

//   if (uploadError) throw uploadError;

//   const { data: urlData } = supabase.storage
//     .from("photos")
//     .getPublicUrl(path);

//   const { error: insertError } = await supabase.from("photos").insert({
//     image_url: urlData.publicUrl,
//     storage_path: path,
//   });

//   if (insertError) throw insertError;
// }

// export async function fetchPhotos(): Promise<Photo[]> {
//   const { data: photos, error: photosError } = await supabase
//     .from("photos")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (photosError) throw photosError;

//   const { data: comments, error: commentsError } = await supabase
//     .from("comments")
//     .select("*")
//     .order("created_at", { ascending: true });

//   if (commentsError) throw commentsError;

//   return (photos || []).map((photo) => ({
//     ...photo,
//     comments: (comments || []).filter((c) => c.photo_id === photo.id),
//   }));
// }

// export async function addComment(photoId: string, content: string) {
//   const { error } = await supabase.from("comments").insert({
//     photo_id: photoId,
//     content: content.trim(),
//   });

//   if (error) throw error;
// }
