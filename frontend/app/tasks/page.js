'use client';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const router = useRouter();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Low',
    status: 'Pending',
    assignedTo: [], // now an array
    createdBy: '',
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentEmailId, setCurrentEmailId] = useState('');
  const [userName, setUserName] = useState('');
  const [createdByMe, setCreatedByMe] = useState([]);
  const [assignedToMe, setAssignedToMe] = useState([]);
  const [showAssignedTasks, setShowAssignedTasks] = useState(true);
  const [showCreatedTasks, setShowCreatedTasks] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null); // null = not editing

  /*useEffect(() => {
    const token = localStorage.getItem('token'); // or sessionStorage
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded:', decoded);
        setCurrentUserId(decoded.id); // assuming your token payload has `id`
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);
  useEffect(() => {
    console.log("Current User ID:", currentUserId);
  },[currentUserId])
*/
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const name = decoded.name;
      const emailID = decoded.email;
      console.log("Decoded:", decoded);
      setCurrentUserId(userId);
      setCurrentEmailId(emailID)
      setUserName(name);
      setNewTask(prev => ({ ...prev, createdBy: userId }));
      fetchTasks(token);
      
    } catch (error) {
      console.error("Invalid token", error);
      router.push('/login');
    }
  }, []);
  useEffect(() => {
    console.log("Current Email ID:", currentEmailId);
  },[currentEmailId])
  useEffect(() => {
    console.log("fetched:", tasks);
  },[tasks])

  useEffect(() => {
    console.log("currentUserId ", currentUserId);
    if (!currentUserId || tasks.length===0) return;
    
    setCreatedByMe(tasks.filter(task => task.createdBy._id === currentUserId));
    setAssignedToMe(tasks.filter(task => {
      if (Array.isArray(task.assignedTo)) {
        return task.assignedTo.includes(currentEmailId);
      }
      return task.assignedTo === currentUserId;
    }));
  }, [tasks, currentUserId]);
  
  useEffect(() => {
    console.log("Created By Me (direct):", createdByMe);
    console.log("Assigned To Me (direct):", assignedToMe);
  }, [createdByMe , assignedToMe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log("Sending task data:", newTask);
    if (editingTaskId) {
      // Update existing task
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        });
  
        if (!res.ok) {
          console.error('Failed to update task');
          return;
        }
  
        const updatedTask = await res.json();
        setTasks(tasks.map(task => task._id === editingTaskId ? updatedTask : task));
        setEditingTaskId(null); // reset editing state
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } 
    else{
      try{
    const res = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    });
    if (!res.ok) {
      console.error('Failed to add task:', await res.text());
      return;
    }
    const createdTask = await res.json();
    setTasks([...tasks, createdTask]); // add it to the list
  }
  catch (error) {
    console.error('Error creating task:', error);
  }
    }
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Low',
      status: 'Pending',
      assignedTo: [], // now an array
      createdBy: '',
    }); // clear form
    
    
  };
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to Delete this Task?");
    if (!confirmDelete) return;
  
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const fetchTasks = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) throw new Error('Failed to fetch tasks');
  
      const data = await res.json();
      setTasks(data);
      console.log("All data:", data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  
  const getTaskStatus = (task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays < 0 && task.status !== 'Completed') {
      return { label: 'Overdue', daysLeft: 0 };
    }
  
    return { label: task.status, daysLeft: diffDays };
  };


  return(
    <div className="p-8">
      <div className="flex items-center space-x-2 text-gray-700">
        <p style={{color:'WHITE'}}>Task Management System |</p><br></br>
      <svg xmlns="http://www.w3.org/2000/svg" 
        fill="none" viewBox="0 0 24 24" 
        strokeWidth={1.5} stroke="currentColor" 
        className="w-6 h-6 text-blue-600">
      <path strokeLinecap="round" strokeLinejoin="round" 
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0H4.5z" />
    </svg>
    <span className="font-semibold">Welcome, {userName}</span>
  </div>
      <div className="flex justify-end items-center mb-4">
        <button
        onClick={() => setShowLogoutConfirm(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
        Logout
        </button>
    </div>

      <div className="flex gap-8 flex-wrap">
        <div className="flex-1 min-w-[300px]">
        <h1 className="text-2xl font-semibold mb-4">Assigned to You</h1>
        
        {showAssignedTasks && (
          
        <ul className="flex gap-4 overflow-x-auto" style={{color:'GREY'}}>
          
          {assignedToMe.map((task) => (
            
            <li key={task._id} className="w-64 p-4 border rounded bg-white shadow">
              <div>
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p>-{task.description}</p>
              <p>
                -Assigned To:{' '}
                {Array.isArray(task.assignedTo)
                ? task.assignedTo.join(', ')
                : task.assignedTo}
              </p>

              <p>-Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p>-Priority: {task.priority}</p>
              {(() => {
                        const { label, daysLeft } = getTaskStatus(task);
                        return (
                        <>
                      <p>-Status: <span className={label === 'Overdue' ? 'text-red-600 font-bold' : ''}>{label}</span></p>
                    {label !== 'Completed' && <p>-Days Left:{daysLeft >= 0 ? `${daysLeft} day(s) left` : 'Due date passed'}</p>}
                  </>
                          );
              })()}

              <p>-Created By: {task.createdBy.name}</p>
              <p>-Created on:{task.createdAt ? new Date(task.createdAt).toLocaleDateString(): 'N/A'}</p>
              </div>
              <button
              onClick={() => handleDelete(task._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 gap-4"
              >
              Delete
              </button>
              <button
                onClick={() => {
                setNewTask({
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate?.split('T')[0] || '',
                  priority: task.priority,
                  status: task.status,
                  assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo],
                  createdBy: task.createdBy,
                });
                setEditingTaskId(task._id);
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2 gap-4"
              >
            Edit
            </button>
            </li>
          ))}
        </ul>)}</div>
        <div className="flex-1 min-w-[300px]">
        <h1 className="text-2xl font-semibold mb-4">Created by You</h1>
        {showCreatedTasks &&(
        <ul className="flex gap-4 overflow-x-auto" style={{color:'GREY'}}>
          {createdByMe.map((task) => (
            <li key={task._id} className="w-64 p-4 border rounded bg-white shadow">
              <div>
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p>-{task.description}</p>
              <p>
                -Assigned To:{' '}
                {Array.isArray(task.assignedTo)
                ? task.assignedTo.join(', ')
                : task.assignedTo}
              </p>

              <p>-Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              <p>-Priority: {task.priority}</p>
              {(() => {
                        const { label, daysLeft } = getTaskStatus(task);
                        return (
                        <>
                      <p>-Status: <span className={label === 'Overdue' ? 'text-red-600 font-bold' : ''}>{label}</span></p>
                    {label !== 'Completed' && <p>-Days Left:{daysLeft >= 0 ? `${daysLeft} day(s) left` : 'Due date passed'}</p>}
                  </>
                          );
              })()}
              <p>-Created By:{task.createdBy.name}</p>
              <p>-Created on:{task.createdAt ? new Date(task.createdAt).toLocaleDateString(): 'N/A'}</p>
              </div>
              <button
              onClick={() => handleDelete(task._id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
              Delete
              </button>
              <button
                onClick={() => {
                setNewTask({
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate?.split('T')[0] || '',
                  priority: task.priority,
                  status: task.status,
                  assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo],
                  createdBy: task.createdBy,
                });
                setEditingTaskId(task._id);
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-2"
              >
            Edit
            </button>

            </li>
          ))}
        </ul>)}</div>
      </div>
      <br></br>
      <br></br>
      <div className="mb-8" style={{width:'80%'}}>
        <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <input
          type="text"
          placeholder="Assign to (comma-separated user IDs or emails)"
          value={newTask.assignedTo.join(',')}
          onChange={(e) =>
          setNewTask({ ...newTask, assignedTo: e.target.value.split(',').map(i => i.trim()) })
          }
          className="w-full border px-3 py-2 rounded"
          />


          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            required
          />
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <select
            value={newTask.status}
            onChange={(e) =>
              setNewTask({ ...newTask, status: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Task
          </button>
        </form>
      </div>

      
    
    {showLogoutConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-md w-80">
          <h2 className="text-lg font-semibold mb-4" style={{color:'GREY'}}>Confirm Logout</h2>
          <p className="mb-4" style={{color:'GREY'}}>Do you really want to logout?</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 border rounded"
              style={{color:'GREY'}}
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
    
  );
}
