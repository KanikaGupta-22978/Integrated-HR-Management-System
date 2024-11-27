import React, { useState } from 'react';
import axios from 'axios';

function AddEmployee() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const [departmentId, setDepartmentId] = useState(1);
    const [error, setError] = useState('');

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/employees', {
                name,
                email,
                designation,
                departmentId,
            });
            console.log('Employee added:', response.data);
            // You can redirect to the employee list or show a success message
        } catch (err) {
            setError('Error adding employee');
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <h3>Add Employee</h3>
            <form onSubmit={handleAddEmployee}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                />
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                    <option value="1">HR</option>
                    <option value="2">Engineering</option>
                    <option value="3">Finance</option>
                    <option value="4">Marketing</option>
                </select>
                <button type="submit">Add Employee</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default AddEmployee;
