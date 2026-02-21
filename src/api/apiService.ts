
import { apiClient } from './apiClient';

export async function fetchOrganizations() {
  const res = await apiClient.get('/api/organizations');
  return res.data.data;
}

export async function fetchRoles() {
  const res = await apiClient.get('/api/roles');
  return res.data.data;
}

export async function addOrganizations(payload:any) {
  const res = await apiClient.post("/api/organizations", payload);
  return res.data.data; // returns the created Organizations
}

// Edit an existing  Organizations
export async function editOrganizations(id: any, payload: any) {
  const res = await apiClient.put(`/api/organizations/${id}`, payload);
  return res.data.data; // returns the updated Organizations
}

// Delete a  Organizations
export async function deleteOrganizations(id: any) {
  const res = await apiClient.delete(`/api/organizations/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

export async function fetchUsers() {
  const res = await apiClient.get('/api/users');
  return res.data.data;
}

// Fetch documents
export async function fetchDocuments() {
  const res = await apiClient.get('/api/documents');
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

  const res = await apiClient.post('/api/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data;
}

//Delete document

export async function deleteDocument(documentId: string) {
  const res = await apiClient.delete(`/api/documents/${documentId}`);
  return res.data.data;
}

// Fetch guardrail

export async function fetchGuardrails() {
  const res = await apiClient.get('/api/guardrails');
  return res.data.data;
}

// Add a new guardrail
export async function addGuardrail(payload:any) {
  const res = await apiClient.post("/api/guardrails", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing guardrail
export async function editGuardrail(id: string, payload: any) {
  const res = await apiClient.put(`/api/guardrails/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a guardrail
export async function deleteGuardrail(id: string) {
  const res = await apiClient.delete(`/api/guardrails/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Pre Call Plans

export async function fetchPreCallPlans() {
  const res = await apiClient.get('/api/pre-call-plans');
  return res.data.data;
}

// Add a new  Pre Call Plans
export async function addPreCallPlans(payload:any) {
  const res = await apiClient.post("/api/pre-call-plans", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlans(id: any, payload: any) {
  const res = await apiClient.put(`/api/pre-call-plans/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deletePreCallPlans(id: string) {
  const res = await apiClient.delete(`/api/pre-call-plans/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

export async function addPreCallPlansQuestions(payload:any, plan_id:any) {
  const res = await apiClient.post(`/api/pre-call-plans/${plan_id}/questions`, payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlansQuestions(payload: any , plan_id:any, question_id:any) {
  const res = await apiClient.put(`/api/pre-call-plans/${plan_id}/questions/${question_id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deletePreCallPlansQuestions(plan_id: any, question_id: any) {
  const res = await apiClient.delete(`/api/pre-call-plans/${plan_id}/questions/${question_id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Meta 

export async function fetchMetaData() {
  const res = await apiClient.get('/api/metadata');
  return res.data.data;
}

// Fetch Avatars

export async function fetchAvatars() {
  const res = await apiClient.get('/api/avatars');
  return res.data.data;
}

export async function addAvatar(payload:any) {
  const res = await apiClient.post("/api/avatars", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editAvatar(id: any, payload: any) {
  const res = await apiClient.put(`/api/avatars/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deleteAvatar(id: any) {
  const res = await apiClient.delete(`/api/avatars/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Avatars Configurations

export async function fetchAvatarConfigurations() {
  const res = await apiClient.get('/api/avatar-configs');
  return res.data.data;
}

// Upload avatar configuration
export async function uploadAvatarConfiguration(formData) {

  const res = await apiClient.post('/api/avatar-configs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data;
}

//Delete document

export async function deleteAvatarConfiguration(documentId: string) {
  const res = await apiClient.delete(`/api/avatar-configs/${documentId}`);
  return res.data.data;
}

// Fetch Role Plays 

export async function fetchRolePlays() {
  const res = await apiClient.get('/api/role-plays');
  return res.data.data;
}


export async function addRoleplay(payload:any) {
  const res = await apiClient.post("/api/role-plays", payload);
  return res.data.data; // returns the created guardrail
}

// Edit an existing  Pre Call Plans
export async function editRoleplay(id: any, payload: any) {
  const res = await apiClient.put(`/api/role-plays/${id}`, payload);
  return res.data.data; // returns the updated guardrail
}

// Delete a  Pre Call Plans
export async function deleteRoleplay(id: any) {
  const res = await apiClient.delete(`/api/role-plays/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}


// Fetch Categories

export async function fetchCategories() {
  const res = await apiClient.get('/api/categories');
  return res.data.data;
}

export async function addCategory(payload:any) {
  const res = await apiClient.post("/api/categories", payload);
  return res.data.data; // returns the created category
}

// Edit an existing  Category
export async function editCategory(id: any, payload: any) {
  const res = await apiClient.put(`/api/categories/${id}`, payload);
  return res.data.data; // returns the updated category
}

// Delete a  Category
export async function deleteCategory(id: any) {
  const res = await apiClient.delete(`/api/categories/${id}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Fetch Sub Categories 
export async function fetchSubCategories(categoryId: string) {
  const res = await apiClient.get(`/api/categories/${categoryId}/subcategories`);
  return res.data.data;
}

export async function addSubCategory(payload:any) {
  const res = await apiClient.post(`/api/sub-categories`, payload);
  return res.data.data; // returns the created subcategory
}

// Edit an existing  SubCategory
export async function editSubCategory(subCategoryId: string, payload: any) {
  const res = await apiClient.put(`/api/sub-categories/${subCategoryId}`, payload);
  return res.data.data; // returns the updated subcategory
}

// Delete a  SubCategory
export async function deleteSubCategory(subCategoryId: string) {
  const res = await apiClient.delete(`/api/sub-categories/${subCategoryId}`);
  return res.data.data; // can return some confirmation or the deleted object
}


export async function addUser(payload:any) {
  const res = await apiClient.post(`/api/users`, payload);
  return res.data.data; // returns the created User
}

// Edit an existing  User
export async function updateUserAPi(UserId: string, payload: any) {
  const res = await apiClient.put(`/api/users/${UserId}`, payload);
  return res.data.data; // returns the updated User
}

// Delete a  User
export async function deleteUserApi(UserId: string) {
  const res = await apiClient.delete(`/api/users/${UserId}`);
  return res.data.data; // can return some confirmation or the deleted object
}

// Create Role
export async function createRole(payload: any) {
  const res = await apiClient.post("/api/roles", payload);
  return res.data.data; // returns the created role
}



// Edit Role
export async function updateRoleApi(RoleId: any, payload: any) {
  const res = await apiClient.put(`/api/roles/${RoleId}`, payload);
  return res.data.data; // returns the updated role
}

// Delete Role
export async function deleteRoleApi(RoleId: any) {
  const res = await apiClient.delete(`/api/roles/${RoleId}`);
  return res.data.data; // can return some confirmation or the deleted object
}

export async function fetchAssignment() {
  const res = await apiClient.get('/api/assignments');
  return res.data.data;
}

// Create Assignment
export async function createAssignment(payload: any) {
  const res = await apiClient.post("/api/assignments", payload);
  return res.data.data; // returns the created assignment
}



// Edit Assignment
export async function updateAssignmentApi(assignmentId: any, payload: any) {
  const res = await apiClient.put(`/api/assignments/${assignmentId}`, payload);
  return res.data.data; // returns the updated assignment
}

// Delete Assignment
export async function deleteAssignment(assignmentId: any) {
  const res = await apiClient.delete(`/api/assignments/${assignmentId}`);
  return res.data.data; // can return some confirmation or the deleted object
}


export async function fetchCertificate() {
  const res = await apiClient.get('/api/certifications');
  return res.data.data;
}


export async function createCertificate(payload: any) {
  const res = await apiClient.post("/api/certifications", payload);
  return res.data.data; // returns the created certificate
}



// Edit Certificate
export async function updateCertificateApi(certificateId: any, payload: any) {
  const res = await apiClient.put(`/api/certifications/${certificateId}`, payload);
  return res.data.data; // returns the updated certificate
}

// Delete Certificate
export async function deleteCertificate(certificateId: any) {
  const res = await apiClient.delete(`/api/certifications/${certificateId}`);
  return res.data.data; // can return some confirmation or the deleted object
}




