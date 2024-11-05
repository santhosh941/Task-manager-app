
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {

  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [filteredTask, setFilteredTask] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchData, { loading }] = useFetch();

  // Define applyFilter 
  const applyFilter = (search, status, priority,dueDate) => {
    let updatedTasks = tasks;

    // Search filter
    if (search) {
      updatedTasks = updatedTasks.filter(task =>
        task.taskname.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (status) {
      updatedTasks = updatedTasks.filter(task => task.status === status);
    }

    // Priority filter
    if (priority) {
      updatedTasks = updatedTasks.filter(task => task.priority === priority);
    }
   if (dueDate){
  const dueDateObj=new Date(dueDate);
  updatedTasks=updatedTasks.filter(task=>{
    const taskduedate=new Date(task.dueDate);
    return taskduedate.toDateString()===dueDateObj.toDateString();
  })
   }   
    setFilteredTask(updatedTasks);
  };

  const fetchTasks = useCallback(() => {
    const config = { url: "/tasks", method: "get", headers: { Authorization: authState.token } };
    fetchData(config, { showSuccessToast: false }).then(data => {
      setTasks(data.tasks);
      setFilteredTask(data.tasks);
    });
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilter(query, statusFilter, priorityFilter);
  };

  //  handleStatusFilter
  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    applyFilter(searchQuery, status, priorityFilter);
  };

  // Define handlePriorityFilter
  const handlePriorityFilter = (e) => {
    const priority = e.target.value;
    setPriorityFilter(priority);
    applyFilter(searchQuery, statusFilter, priority);
  };
  // handles duedatefilter
  const handleDueDateFilter = (e) => {
    const dueDate = e.target.value;
    setDueDateFilter(dueDate);
    applyFilter(searchQuery, statusFilter, priorityFilter, dueDate);
  };
  const handleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Incomplete' ? 'Completed' : 'Incomplete';
    const config = { url: `/tasks/${id}/status`, method: "put", data: { status: newStatus }, headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  };

  const handleDelete = (id) => {
    const config = { url: `/tasks/${id}`, method: "delete", headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  };

  return (
    <>
      <div className='flex justify-center mt-10'>
       {/* search bar */}
        <input 
          type='search'
          className='w-[700px] p-2 rounded-md border border-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='search tasks..'
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        {/* Status Filter */}
        <h2 className='text-xl mt-3'>Filters</h2>
        <select
          className="border border-gray-300 px-4 py-2 rounded-md"
          value={statusFilter}
          onChange={handleStatusFilter} 
        >
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Incomplete">Incomplete</option>
        </select>

        {/* Priority Filter */}
        <select
          className="border border-gray-300 px-4 py-2 rounded-md"
          value={priorityFilter}
          onChange={handlePriorityFilter} 
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          className="border border-gray-300 px-4 py-2 rounded-md"
          value={dueDateFilter}
          onChange={handleDueDateFilter}
        />
      </div>
      
      <div className="my-2 mx-auto max-w-[700px] py-4">

        {tasks.length !== 0 && <h2 className='my-2 ml-2 md:ml-0 text-xl'>Your tasks ({tasks.length})</h2>}
        {loading ? (
          <Loader />
        ) : (
          <div>
            {filteredTask.length === 0 ? (
              <div className='w-[600px] h-[300px] flex items-center justify-center gap-4'>
                <span>No tasks found</span>
                <Link to="/tasks/add" className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2">+ Add new task</Link>
              </div>
            ) : (
              // displaying task lists
              filteredTask.map((task, index) => ( 
                <div key={task._id} className='bg-white my-4 p-4 text-gray-600 rounded-md shadow-md'>
                  <div className='flex gap-2'>
                    <span className='font-medium'>{index + 1}. {task.taskname}</span>
                    <Tooltip text={"Edit this task"} position={"top"}>
                      <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                    </Tooltip>
                    <Tooltip text={"Delete this task"} position={"top"}>
                      <span className='text-red-500 cursor-pointer' onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </Tooltip>
                  </div>
                  <div className='mb-2 whitespace-pre'>{task.description}</div>
                  <span className='mb-2 text-sm gap-3'>Priority: {task.priority}</span>
                  <span className='text-sm mb-5 ml-10'>Due Date: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <br />
                  <div className='mt-3'>
                    <button
                      className={`px-4 py-1 rounded-md ${task.status === 'Completed' ? 'bg-green-400 text-black' : 'bg-red-600 text-black'}`}
                      onClick={() => handleStatus(task._id, task.status)}
                    >
                      {task.status === 'Completed' ? 'Completed' : 'Incomplete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
