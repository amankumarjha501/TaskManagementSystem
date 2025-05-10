"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("token", data.token);
      router.push("/tasks");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 style={{color:'WHITE'}}>Task Management System </h1>
      <h5 className="text-xl mb-4">Welcome Back!</h5>
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><br></br>
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" /><br></br>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded">Login</button>
      <center><a href="/register"style={{color:'lightblue'}}>New here? Register</a></center>
    </form>
    </div>
  );
}
