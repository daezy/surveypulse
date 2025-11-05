import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const uploadSurveyFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/v1/surveys/upload-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadTwoFileSurvey = async (schemaFile, responsesFile) => {
  const formData = new FormData();
  formData.append("schema_file", schemaFile);
  formData.append("responses_file", responsesFile);

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
