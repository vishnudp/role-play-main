// src/api/organizationApi.ts
import { apiClient } from './apiClient';

export async function fetchOrganizations() {
  const res = await apiClient.get('/organizations');
  return res.data.data;
}

export async function fetchUsers() {
  const res = await apiClient.get('/users');
  return res.data.data;
}

export async function fetchDocuments() {
  const res = await apiClient.get('/documents');
  console.log('res',res)
  return res.data.data;
}

export async function uploadDocument({
  name,
  organization_id,
  file,
}: {
  name: string;
  organization_id?: string;
  file: File;
}) {
  if (!(file instanceof File) || !file.name) {
    console.error('uploadDocument: file is not a valid File object', file);
    throw new Error('No valid file selected for upload.');
  }

  const formData = new FormData();
  formData.append('name', name);

  if (organization_id) {
    formData.append('organization_id', organization_id);
  }

  formData.append('file', file); // filename automatically included

  const res = await apiClient.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data;
}


export async function deleteDocument(documentId: string) {
  const res = await apiClient.delete(`/documents/${documentId}`);
  return res.data.data;
}
