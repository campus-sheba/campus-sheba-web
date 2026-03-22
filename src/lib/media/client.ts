import { convertPayloadToFormData } from "@/utils/helpers/formdata/convertFormData";
import { MediaFeatureName, type UploadFileSuccessResponse } from "@/types/media";
import { postPrivate } from "@/utils/api/post";
import { deletePrivate } from "@/utils/api/delete";
import { mediaEndpoints } from "@/utils/endpoints/endpoints";

type UploadResult = {
  success: boolean;
  urls: string[];
  message?: string;
};

export async function uploadMediaFiles(
  files: File[],
  feature: MediaFeatureName,
): Promise<UploadResult> {
  const urls: string[] = [];

  try {
    for (const file of files) {
      const formData = convertPayloadToFormData({ file, feature });

      const uploadResponse = await postPrivate<UploadFileSuccessResponse>(
        mediaEndpoints.upload,
        formData,
      );

      const uploadedUrl = uploadResponse?.data?.url;

      if (!uploadedUrl) {
        return {
          success: false,
          urls,
          message: "Failed to upload one or more files",
        };
      }

      urls.push(uploadedUrl);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload one or more files";
    return { success: false, urls, message };
  }

  return { success: true, urls };
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
