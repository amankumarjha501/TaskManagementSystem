'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      router.push('/login');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 style={{color:'WHITE'}}>Task Management System </h1>
      <h5 className="text-xl mb-4">Register</h5>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
        <button type="submit" className="bg-green-600 text-white py-2 rounded">Register</button>
        <center><a href="/login"style={{color:'lightblue'}}>Already a User? Login</a></center>
      </form>
    </div>
  );
}
