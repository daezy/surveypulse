import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth and logging
api.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data || ""
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: new_refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error(
      `❌ API Response Error: ${error.config?.url}`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Health check
export const healthCheck = async () => {
  const response = await api.get("/api/v1/health");
  return response.data;
};

// Survey APIs
export const uploadSurvey = async (data) => {
  const response = await api.post("/api/v1/surveys/upload", data);
  return response.data;
};

export const uploadSurveyFile = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Add metadata if provided (even if empty - backend will handle defaults)
  if (metadata.title !== undefined && metadata.title !== null) {
    formData.append("title", metadata.title);
    console.log("📝 Adding title:", metadata.title);
  }
  if (metadata.description !== undefined && metadata.description !== null) {
    formData.append("description", metadata.description);
    console.log("📝 Adding description:", metadata.description);
  }
  if (metadata.tags !== undefined && metadata.tags !== null) {
    formData.append("tags", metadata.tags);
    console.log("🏷️ Adding tags:", metadata.tags);
  }

  const response = await api.post("/api/v1/surveys/upload-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadTwoFileSurvey = async (
  schemaFile,
  responsesFile,
  metadata = {}
) => {
  const formData = new FormData();
  formData.append("schema_file", schemaFile);
  formData.append("responses_file", responsesFile);

  // Add metadata if provided (even if empty - backend will handle defaults)
  if (metadata.title !== undefined && metadata.title !== null) {
    formData.append("title", metadata.title);
    console.log("📝 Adding title:", metadata.title);
  }
  if (metadata.description !== undefined && metadata.description !== null) {
    formData.append("description", metadata.description);
    console.log("📝 Adding description:", metadata.description);
  }
  if (metadata.tags !== undefined && metadata.tags !== null) {
    formData.append("tags", metadata.tags);
    console.log("🏷️ Adding tags:", metadata.tags);
  }

  const response = await api.post("/api/v1/surveys/upload-two-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getSurveys = async () => {
  const response = await api.get("/api/v1/surveys/");
  return response.data;
};

export const getSurvey = async (surveyId) => {
  const response = await api.get(`/api/v1/surveys/${surveyId}`);
  return response.data;
};

export const deleteSurvey = async (surveyId) => {
  const response = await api.delete(`/api/v1/surveys/${surveyId}`);
  return response.data;
};

// Analysis APIs
export const startAnalysis = async (data) => {
  const response = await api.post("/api/v1/analysis/analyze", data);
  return response.data;
};

export const getAnalysisResults = async (surveyId) => {
  const response = await api.get(`/api/v1/analysis/${surveyId}/results`);
  return response.data;
};

export const getAnalysisStatus = async (surveyId) => {
  const response = await api.get(`/api/v1/analysis/${surveyId}/status`);
  return response.data;
};

export const getAllAnalysisResults = async (surveyId) => {
  const response = await api.get(`/api/v1/analysis/${surveyId}/all-results`);
  return response.data;
};

export const deleteAnalysis = async (analysisId) => {
  const response = await api.delete(`/api/v1/analysis/${analysisId}`);
  return response.data;
};

export default api;
