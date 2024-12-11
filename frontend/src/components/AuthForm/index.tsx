import React, { useState } from "react";
import { Loader } from "../Loader";
import { registerUser, loginUser } from "../../services/api";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "./styles.css";

interface AuthFormProps {
  onAuthSuccess: (token: string) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password);
        const response = await loginUser(email, password);
        const token = response.data.access_token;
        Cookies.set("token", token, { expires: 1 });
        onAuthSuccess(token);
      } else {
        const response = await loginUser(email, password);
        const token = response.data.access_token;
        Cookies.set("token", token, { expires: 1 / 24 });
        onAuthSuccess(token);
      }
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      {loading ? (
        <Loader />
      ) : (
        <>
          <h2 className="auth-form__title">
            {isRegister ? "Register" : "Login"}
          </h2>
          <form className="auth-form__form" onSubmit={handleAuth}>
            <input
              className="auth-form__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              className="auth-form__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button className="auth-form__button" type="submit">
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          <button
            className="auth-form__toggle-button"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Switch to Login" : "Switch to Register"}
          </button>
        </>
      )}
    </div>
  );
}
