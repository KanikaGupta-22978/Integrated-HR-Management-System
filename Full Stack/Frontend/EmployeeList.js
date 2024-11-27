import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000';

function EmployeeList({ authToken }) {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/employees`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setEmployees(data);
                } else {
                    alert('Failed to fetch employees.');
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchEmployees();
    }, [authToken]);

    return (
        <div>
            <h2>Employee List</h2>
            <ul>
                {employees.map((employee) => (
                    <li key={employee.id}>
                        {employee.name} - {employee.email}
                    </li>
                ))}
            </ul>
            <Link to="/add-employee">Add Employee</Link>
        </div>
    );
}

export default EmployeeList;
