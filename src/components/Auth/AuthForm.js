import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerOrLogin } from "../../services/auth";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // If registering, include team name
      const data = await registerOrLogin(email, password);

      if (data.token) {
        console.log(
          isLogin ? "Login successful" : "Registration successful",
          data
        );
        navigate("/team");
      } else {
        setError(data.msg || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="auth-form">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin
          ? "Need an account? Register here."
          : "Already have an account? Login here."}
      </p>
    </div>
  );
};

export default AuthForm;
