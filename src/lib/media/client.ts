import { convertPayloadToFormData } from "@/utils/helpers/formdata/convertFormData";
import { MediaFeatureName, type UploadFileSuccessResponse } from "@/types/media";
import { postPrivate } from "@/utils/api/post";
import { deletePrivate } from "@/utils/api/delete";
import { mediaEndpoints } from "@/utils/endpoints/endpoints";

export type UploadedMediaMeta = {
  url: string;
  key: string;
  size: number;
};

type UploadResult = {
  success: boolean;
  urls: string[];
  /** Per-file metadata when upload succeeds */
  files?: UploadedMediaMeta[];
  message?: string;
};

export async function uploadMediaFiles(
  files: File[],
  feature: MediaFeatureName,
): Promise<UploadResult> {
  const urls: string[] = [];
  const meta: UploadedMediaMeta[] = [];

  try {
    for (const file of files) {
      const formData = convertPayloadToFormData({ file, feature });

      const uploadResponse = await postPrivate<UploadFileSuccessResponse>(
        mediaEndpoints.upload,
        formData,
      );

      const data = uploadResponse?.data;
      const uploadedUrl = data?.url;

      if (!uploadedUrl) {
        return {
          success: false,
          urls,
          message: "Failed to upload one or more files",
        };
      }

      urls.push(uploadedUrl);
      meta.push({
        url: uploadedUrl,
        key: data.key ?? "",
        size: data.size ?? file.size,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload one or more files";
    return { success: false, urls, message };
  }

  return { success: true, urls, files: meta };
}

export async function deleteMediaByKey(key: string): Promise<{ success: boolean; message?: string }> {
  try {
    await deletePrivate<{ message?: string }>(mediaEndpoints.delete, { key });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media";
    return { success: false, message };
  }
}
