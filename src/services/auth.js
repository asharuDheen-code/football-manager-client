import api from "./api";

export const registerOrLogin = async (email, password, teamName) => {
  const response = await api.post("/auth", { email, password, teamName });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const getTeam = async () => {
  const response = await api.get("/team");
  return response.data;
};
