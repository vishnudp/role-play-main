// src/lib/lookupUtils.ts

/**
 * Get organization name by id from organizations array
 * @param organizations Array of organization objects
 * @param id Organization id to look up
 * @returns Organization name or 'Unknown'
 */
import { API_BASE_URL } from '../config/apiConfig';
import { toast } from "sonner";

export function getOrganizationName(organizations: any[], id: string): string {
  const org = organizations.find((o) => o.id === id);
  return org?.name || 'N/A';
}

export function getAvatarName(avatars: any[], id: string): string {
  const avatar = avatars.find((a) => a.id === id);
  return avatar?.name || 'N/A';
}

export function getCategoryName(categories: any[], id: string): string {
  const category = categories.find((c) => c.id === id);
  return category?.name || 'N/A';
}

export function getSubCategoryName(categories: any[], category_id: string, id: string): string {
  const category = categories.find((c) => c.id === category_id);
  const subcategory = category?.children?.find((sc) => sc.id === id);
  return subcategory?.name || 'N/A';
}

/**
 * Get user name by id from users array
 * @param users Array of user objects
 * @param id User id to look up
 * @returns User name or 'N/A'
 */
export function getUserName(users: any[], id: string): string {
  let lookupId = id;
  let userName = 'N/A';
  if (lookupId) {
    try {
      const loginUser = JSON.parse(localStorage.getItem('user') || '{}');
      if(loginUser && loginUser.id && loginUser.id === lookupId) {
        userName = loginUser.name || 'N/A';
      } else {
        const user = users.find((u) => u.id === lookupId || u.loginUserId === lookupId);
        userName =  user?.name || 'N/A';
      }
    } catch (e) {
      lookupId = undefined;
    }
  }
  return userName
  
}

export function formatToLongDate(isoString) {
  const date = new Date(isoString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatFileSize(bytes) {
  const units = ["Bytes", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1000 && unitIndex < units.length - 1) {
    size = size / 1000;
    unitIndex++;
  }

  return `${size?.toFixed(1)} ${units[unitIndex]}`;
}

export function handleView(doc: any)  {
  const fileUrl = doc.url || doc.url || doc.path || doc.photo;

  if (!fileUrl) {
    toast.error("File URL not available");
    return;
  }

  // Open in new browser tab
  window.open(`${API_BASE_URL}/${fileUrl}`, "_blank", "noopener,noreferrer");
};

export async function handleDownload(doc: any)  {
  const fileUrl = doc.url || doc.url || doc.path || doc.photo;

  if (!fileUrl) {
    toast.error("File URL not available");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${fileUrl}`);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = doc.name || doc.name || "document";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    toast.error("Failed to download file");
  }
};
