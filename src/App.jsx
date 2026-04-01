import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClienteForm from "./ClienteForm";
import AdminGate from "./AdminGate";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClienteForm />} />
        <Route path="/admin" element={<AdminGate />} />
      </Routes>
    </BrowserRouter>
  );
}