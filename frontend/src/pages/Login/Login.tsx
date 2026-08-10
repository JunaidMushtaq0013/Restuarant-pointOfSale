import {  useState } from "react";
import api from "../../api/axious";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

 try {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  navigate("/dashboard");
  toast.success(response.data.message);

  
} catch (error: any) {
  toast.error(
    error.response?.data?.message || "Login failed. Please try again."
  );
}
  };

return (
  <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Warisoft POS
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Restaurant Management System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);
};

export default Login;