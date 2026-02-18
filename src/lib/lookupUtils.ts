// src/lib/lookupUtils.ts

/**
 * Get organization name by id from organizations array
 * @param organizations Array of organization objects
 * @param id Organization id to look up
 * @returns Organization name or 'Unknown'
 */
const API_BASE_URL = 'http://13.51.242.38:4000';
import { toast } from "sonner";

export function getOrganizationName(organizations: any[], id: string): string {
  const org = organizations.find((o) => o.id === id);
  return org?.name || 'Unknown';
}

/**
 * Get user name by id from users array
 * @param users Array of user objects
 * @param id User id to look up
 * @returns User name or 'Unknown'
 */
export function getUserName(users: any[], id: string): string {
  let lookupId = id;
  let userName = 'Unknown';
  if (lookupId) {
    try {
      const loginUser = JSON.parse(localStorage.getItem('user') || '{}');
      if(loginUser && loginUser.id && loginUser.id === lookupId) {
        userName = loginUser.name || 'Unknown';
      } else {
        const user = users.find((u) => u.id === lookupId || u.loginUserId === lookupId);
        userName =  user?.name || 'Unknown';
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

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function handleView(doc: any)  {
  const fileUrl = doc.url || doc.url || doc.path;

  if (!fileUrl) {
    toast.error("File URL not available");
    return;
  }

  // Open in new browser tab
  window.open(`${API_BASE_URL}/${fileUrl}`, "_blank", "noopener,noreferrer");
};

export async function handleDownload(doc: any)  {
  const fileUrl = doc.url || doc.url || doc.path;

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
