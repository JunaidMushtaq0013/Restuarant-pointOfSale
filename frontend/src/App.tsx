import AppRoutes from "./routes/app.routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={2000} />
    </AuthProvider>
  );
}

export default App;