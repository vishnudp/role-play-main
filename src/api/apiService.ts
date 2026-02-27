
import { apiClient } from './apiClient';

import { toast } from 'sonner';

// Helper to handle API errors consistently
export function handleApiError(error: any) {
  console.error('API Error:', error);

  let message = 'Something went wrong. Please try again.';

  if (error?.response) {
    const { status, data, statusText } = error.response;

    // If backend returns JSON with `message` (common case)
    if (data?.message) {
      message = data.message;
    } 
    // If backend returns 500 JSON with success=false and message
    else if (data?.success === false && data?.message) {
      message = data.message;
    }
    // If backend returned plain text
    else if (typeof data === 'string') {
      message = data;
    } 
    // Fallback to HTTP status text
    else if (statusText) {
      message = `Error ${status}: ${statusText}`;
    }
  } else if (error?.message) {
    // Network or JS errors
    message = error.message;
  }

  toast.error(message);
  throw new Error(message);
}


export async function fetchOrganizations() {
  try {
    const res = await apiClient.get('/api/organizations');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

}

export async function fetchRoles() {
  try {
    const res = await apiClient.get('/api/roles');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

}

export async function addOrganizations(payload: any) {
  try {
    const res = await apiClient.post("/api/organizations", payload);
    return res.data.data; // returns the created Organizations

  } catch (error) {
    handleApiError(error);
  }

}

// Edit an existing  Organizations
export async function editOrganizations(id: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/organizations/${id}`, payload);
    return res.data.data; // returns the updated Organizations
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Organizations
export async function deleteOrganizations(id: any) {

  try {
    const res = await apiClient.delete(`/api/organizations/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchUsers() {
  try {
    const res = await apiClient.get('/api/users');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

}

// Fetch documents
export async function fetchDocuments() {
  try {
    const res = await apiClient.get('/api/documents');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

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
  try {
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
  } catch (error) {
    handleApiError(error);
  }

}

// Upload document
export async function uploadDocumentExternal({
  name,
  organization_id,
  file,
}: {
  name: string;
  organization_id?: string;
  file: File;
}) {
  try {
    if (!(file instanceof File) || !file.name) {
      console.error('uploadDocument: file is not a valid File object', file);
      throw new Error('No valid file selected for upload.');
    }

    const formData = new FormData();
    formData.append('file', file); // must match curl: -F 'file=@sample.pdf'
    formData.append('name', name);

    const res = await fetch('https://api.insitehub.com/document_upload', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...(organization_id && {
          'Organization-Id': organization_id,
          'Verification-Token': 'y9sr8rr',
        }),
        'File-Name': file.name,
        // ❌ DO NOT set Content-Type manually when using FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    handleApiError(error);
  }

}

//Delete document

export async function deleteDocument(documentId: string) {
  try {
    const res = await apiClient.delete(`/api/documents/${documentId}`);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

}

// Fetch guardrail

export async function fetchGuardrails() {
  try {
    const res = await apiClient.get('/api/guardrails');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }

}

// Add a new guardrail
export async function addGuardrail(payload: any) {
  try {
    const res = await apiClient.post("/api/guardrails", payload);
    return res.data.data; // returns the created guardrail
  } catch (error) {
    handleApiError(error);
  }

}

// Edit an existing guardrail
export async function editGuardrail(id: string, payload: any) {
  try {
    const res = await apiClient.put(`/api/guardrails/${id}`, payload);
    return res.data.data; // returns the updated guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a guardrail
export async function deleteGuardrail(id: string) {
  try {
    const res = await apiClient.delete(`/api/guardrails/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Pre Call Plans

export async function fetchPreCallPlans() {
  try {
    const res = await apiClient.get('/api/pre-call-plans');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Add a new  Pre Call Plans
export async function addPreCallPlans(payload: any) {
  try {
    const res = await apiClient.post("/api/pre-call-plans", payload);
    return res.data.data; // returns the created guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlans(id: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/pre-call-plans/${id}`, payload);
    return res.data.data; // returns the updated guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Pre Call Plans
export async function deletePreCallPlans(id: any) {
  try {
    const res = await apiClient.delete(`/api/pre-call-plans/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

export async function addPreCallPlansQuestions(payload: any, plan_id: any) {
  try {
    const res = await apiClient.post(`/api/pre-call-plans/${plan_id}/questions`, payload);
    return res.data.data; // returns the created guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  Pre Call Plans
export async function editPreCallPlansQuestions(payload: any, plan_id: any, question_id: any) {
  try {
    const res = await apiClient.put(`/api/pre-call-plans/${plan_id}/questions/${question_id}`, payload);
    return res.data.data; // returns the updated guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Pre Call Plans
export async function deletePreCallPlansQuestions(plan_id: any, question_id: any) {
  try {
    const res = await apiClient.delete(`/api/pre-call-plans/${plan_id}/questions/${question_id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Meta 

export async function fetchMetaData() {
  try {
    const res = await apiClient.get('/api/metadata');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Avatars

export async function fetchAvatars() {
  try {
    const res = await apiClient.get('/api/avatars');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function addAvatar(payload: any) {
  try {
    const res = await apiClient.post("/api/avatars", payload);
    return res.data.data; // returns the created guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  Pre Call Plans
export async function editAvatar(id: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/avatars/${id}`, payload);
    return res.data.data; // returns the updated guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Pre Call Plans
export async function deleteAvatar(id: any) {
  try {
    const res = await apiClient.delete(`/api/avatars/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Avatars Configurations

export async function fetchAvatarConfigurations() {
  try {
    const res = await apiClient.get('/api/avatar-configs');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Upload avatar configuration
export async function uploadAvatarConfiguration(formData) {
  try {
    const res = await apiClient.post('/api/avatar-configs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

//Delete document

export async function deleteAvatarConfiguration(documentId: string) {
  try {
    const res = await apiClient.delete(`/api/avatar-configs/${documentId}`);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Role Plays 

export async function fetchRolePlays() {
  try {
    const res = await apiClient.get('/api/role-plays');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}


export async function addRoleplay(payload: any) {
  try {
    const res = await apiClient.post("/api/role-plays", payload);
    return res.data.data; // returns the created guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  Pre Call Plans
export async function editRoleplay(id: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/role-plays/${id}`, payload);
    return res.data.data; // returns the updated guardrail
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Pre Call Plans
export async function deleteRoleplay(id: any) {
  try {
    const res = await apiClient.delete(`/api/role-plays/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}


// Fetch Categories

export async function fetchCategories() {
  try {
    const res = await apiClient.get('/api/categories');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function addCategory(payload: any) {
  try {
    const res = await apiClient.post("/api/categories", payload);
    return res.data.data; // returns the created category
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  Category
export async function editCategory(id: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/categories/${id}`, payload);
    return res.data.data; // returns the updated category
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  Category
export async function deleteCategory(id: any) {
  try {
    const res = await apiClient.delete(`/api/categories/${id}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

// Fetch Sub Categories 
export async function fetchSubCategories(categoryId: string) {
  try {
    const res = await apiClient.get(`/api/categories/${categoryId}/subcategories`);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function addSubCategory(payload: any) {
  try {
    const res = await apiClient.post(`/api/sub-categories`, payload);
    return res.data.data; // returns the created subcategory
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  SubCategory
export async function editSubCategory(subCategoryId: string, payload: any) {
  try {
    const res = await apiClient.put(`/api/sub-categories/${subCategoryId}`, payload);
    return res.data.data; // returns the updated subcategory
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  SubCategory
export async function deleteSubCategory(subCategoryId: string) {
  try {
    const res = await apiClient.delete(`/api/sub-categories/${subCategoryId}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}


export async function addUser(payload: any) {
  try {
    const res = await apiClient.post(`/api/users`, payload);
    return res.data.data; // returns the created User
  } catch (error) {
    handleApiError(error);
  }
}

// Edit an existing  User
export async function updateUserAPi(UserId: string, payload: any) {
  try {
    const res = await apiClient.put(`/api/users/${UserId}`, payload);
    return res.data.data; // returns the updated User
  } catch (error) {
    handleApiError(error);
  }
}

// Delete a  User
export async function deleteUserApi(UserId: string) {
  try {
    const res = await apiClient.delete(`/api/users/${UserId}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

// Create Role
export async function createRole(payload: any) {
  try {
    const res = await apiClient.post("/api/roles", payload);
    return res.data.data; // returns the created role
  } catch (error) {
    handleApiError(error);
  }
}



// Edit Role
export async function updateRoleApi(RoleId: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/roles/${RoleId}`, payload);
    return res.data.data; // returns the updated role
  } catch (error) {
    handleApiError(error);
  }
}

// Delete Role
export async function deleteRoleApi(RoleId: any) {
  try {
    const res = await apiClient.delete(`/api/roles/${RoleId}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchAssignment() {
  try {
    const res = await apiClient.get('/api/assignments');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

// Create Assignment
export async function createAssignment(payload: any) {
  try {
    const res = await apiClient.post("/api/assignments", payload);
    return res.data.data; // returns the created assignment
  } catch (error) {
    handleApiError(error);
  }
}



// Edit Assignment
export async function updateAssignmentApi(assignmentId: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/assignments/${assignmentId}`, payload);
    return res.data.data; // returns the updated assignment
  } catch (error) {
    handleApiError(error);
  }
}

// Delete Assignment
export async function deleteAssignment(assignmentId: any) {
  try {
    const res = await apiClient.delete(`/api/assignments/${assignmentId}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}


export async function fetchCertificate() {
  try {
    const res = await apiClient.get('/api/certifications');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}


export async function createCertificate(payload: any) {
  try {
    const res = await apiClient.post("/api/certifications", payload);
    return res.data.data; // returns the created certificate
  } catch (error) {
    handleApiError(error);
  }
}



// Edit Certificate
export async function updateCertificateApi(certificateId: any, payload: any) {
  try {
    const res = await apiClient.put(`/api/certifications/${certificateId}`, payload);
    return res.data.data; // returns the updated certificate
  } catch (error) {
    handleApiError(error);
  }
}

// Delete Certificate
export async function deleteCertificate(certificateId: any) {
  try {
    const res = await apiClient.delete(`/api/certifications/${certificateId}`);
    return res.data.data; // can return some confirmation or the deleted object
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchIcons() {
  try {
    const res = await apiClient.get('/api/icons');
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
}





