import { useState } from "react";
import api from "../../api/axious";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      login(response.data.data);
      toast.success(response.data.message);
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Login failed. Please try again.";

      toast.error(
        message,
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(201,154,90,0.12),_transparent_26%),linear-gradient(135deg,#f8f4f0_0%,#efe1cf_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[#e8dcc4] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_20px_40px_rgba(64,42,27,0.08)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d9b06c_0%,#b58241_100%)] text-2xl shadow-[0_12px_25px_rgba(201,154,90,0.18)]">
            🍽️
          </div>

          <h1 className="text-3xl font-semibold tracking-[0.04em] text-[#2a1d18]">
            Warisoft POS
          </h1>

          <p className="mt-2 text-sm text-[#725a4f]">
            Restaurant Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#3a2a24]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#e3d1b2] bg-[#fffaf6] px-4 py-3 text-[#2a1d18] outline-none transition placeholder:text-[#947d6d] focus:border-[#c99a5a] focus:ring-4 focus:ring-[#c99a5a]/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#3a2a24]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#e3d1b2] bg-[#fffaf6] px-4 py-3 text-[#2a1d18] outline-none transition placeholder:text-[#947d6d] focus:border-[#c99a5a] focus:ring-4 focus:ring-[#c99a5a]/10"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
