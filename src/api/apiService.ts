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

// Fetch documents
export async function fetchDocuments() {
  const res = await apiClient.get('/documents');
  return res.data.data;
}

// Upload document
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

//Delete document

export async function deleteDocument(documentId: string) {
  const res = await apiClient.delete(`/documents/${documentId}`);
  return res.data.data;
}

// Fetch guardrail

export async function fetchGuardrails() {
  const res = await apiClient.get('/guardrails');
  return res.data.data;
}

// Add a new guardrail
export async function addGuardrail(payload:any) {
  const res = await apiClient.post("/guardrails", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing guardrail
export async function editGuardrail(id: string, payload: any) {
  const res = await apiClient.put(`/guardrails/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a guardrail
export async function deleteGuardrail(id: string) {
  const res = await apiClient.delete(`/guardrails/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Pre Call Plans

export async function fetchPreCallPlans() {
  const res = await apiClient.get('/pre-call-plans');
  return res.data.data;
}

// Add a new  Pre Call Plans
export async function addPreCallPlans(payload:any) {
  const res = await apiClient.post("/pre-call-plans", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlans(id: any, payload: any) {
  const res = await apiClient.put(`/pre-call-plans/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deletePreCallPlans(id: string) {
  const res = await apiClient.delete(`/pre-call-plans/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

export async function addPreCallPlansQuestions(payload:any, plan_id:any) {
  const res = await apiClient.post(`/pre-call-plans/${plan_id}/questions`, payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlansQuestions(payload: any , plan_id:any, question_id:any) {
  const res = await apiClient.put(`/pre-call-plans/${plan_id}/questions/${question_id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deletePreCallPlansQuestions(plan_id: any, question_id: any) {
  const res = await apiClient.delete(`/pre-call-plans/${plan_id}/questions/${question_id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Meta 

export async function fetchMetaData() {
  const res = await apiClient.get('/metadata');
  return res.data.data;
}

// Fetch Avatars

export async function fetchAvatars() {
  const res = await apiClient.get('/avatars');
  return res.data.data;
}

export async function addAvatar(payload:any) {
  const res = await apiClient.post("/avatars", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editAvatar(id: any, payload: any) {
  const res = await apiClient.put(`/avatars/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deleteAvatar(id: any) {
  const res = await apiClient.delete(`/avatars/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Avatars Configurations

export async function fetchAvatarConfigurations() {
  const res = await apiClient.get('/avatar-configs');
  return res.data.data;
}

// Upload avatar configuration
export async function uploadAvatarConfiguration(formData) {

  const res = await apiClient.post('/avatar-configs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data;
}

//Delete document

export async function deleteAvatarConfiguration(documentId: string) {
  const res = await apiClient.delete(`/avatar-configs/${documentId}`);
  return res.data.data;
}

// Fetch Role Plays 

export async function fetchRolePlays() {
  const res = await apiClient.get('/role-plays');
  return res.data.data;
}


// Fetch Categories

export async function fetchCategories() {
  const res = await apiClient.get('/categories');
  return res.data.data;
}

// Fetch Sub Categories 
export async function fetchSubCategories(categoryId: string) {
  const res = await apiClient.get(`/categories/${categoryId}/subcategories`);
  return res.data.data;
}






