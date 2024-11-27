import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

const EmployeeSection = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    departmentId: "",
    dateOfJoining: "",
    designationId: "",
    panNumber: "",
    phoneNumber: "",
    dob: "",
    basicSalary: "",
    hra: "",
    da: "",
    salaryGrade: "",
    bonus: "",
  });

 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/employees");
      setEmployees(response.data.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/departments");
      setDepartments(response.data.departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  // Fetch designations from API
  const fetchDesignations = async () => {
    try {
      const response = await axios.get("http://localhost:3000/designations");
      setDesignations(response.data.designations); // Set fetched designations
    } catch (err) {
      console.error("Error fetching designations:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
  }, []);

  // Format date for table display
  const formatDate = (date) => {
    if (!date) return "-";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle form submission for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let response;
      if (form.employeeId) {
        // If employeeId is present, update existing employee
        response = await axios.put(`http://localhost:3000/updateEmployee/${form.employeeId}`, form);
        setSuccess("Employee updated successfully!");
      } else {
        // If employeeId is not present, add new employee
        response = await axios.post("http://localhost:3000/addEmployeeWithSalary", form);
        setSuccess("Employee added successfully!");
      }

      fetchEmployees(); // Refresh the employee list
      handleCloseModal(); // Close the modal
      setForm({
        employeeId: "",
        name: "",
        email: "",
        password: "",
        departmentId: "",
        dateOfJoining: "",
        designationId: "",
        panNumber: "",
        phoneNumber: "",
        dob: "",
        basicSalary: "",
    hra: "",
    da: "",
    salaryGrade: "",
    bonus: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while processing the request.");
    }
  };

  // Open the modal for editing
  const handleEdit = (employee) => {
    setForm({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      password: "", // Don't show the password for edit
      departmentId: employee.departmentId,
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split("T")[0] : "", // Ensure correct format for DOJ
      designationId: employee.designationId,
      panNumber: employee.panNumber,
      phoneNumber: employee.phoneNumber,
      dob: employee.dob ? employee.dob.split("T")[0] : "", // Ensure correct format for DOB
      basicSalary: employee.basicSalary,
      hra: employee.hra,
      da: employee.da,
      salaryGrade: employee.salaryGrade,
      bonus: employee.bonus
    });
    setShowModal(true); // Show the modal for editing
  };

  // Handle delete operation
const handleDelete = async (employee) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete the employee: ${employee.name}?`
  );

  if (!confirmDelete) return;

  try {
    // Send DELETE request to API
    await axios.delete(`http://localhost:3000/deleteEmployee/${employee.employeeId}`);
    setSuccess(`Employee ${employee.name} deleted successfully.`);
    
    // Refresh the employee list
    fetchEmployees();
  } catch (err) {
    setError(err.response?.data?.message || "An error occurred while deleting the employee.");
  }
};

  

  // Open the modal for adding a new employee
  const handleAdd = () => {
    setForm({
      employeeId: "",
      name: "",
      email: "",
      password: "",
      departmentId: "",
      dateOfJoining: "",
      designationId: "",
      panNumber: "",
      phoneNumber: "",
      dob: "",
      basicSalary: "",
    hra: "",
    da: "",
    salaryGrade: "",
    bonus: "",
    });
    setShowModal(true); // Show the modal for adding
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false); // Hide the modal
  };

  return (
    <div className="mt-4">
      {/* <h3 className="text-center mb-4">Employees</h3> */}

      {/* Alerts */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <h4>Employee List</h4>
      <Button variant="primary" onClick={handleAdd} className="mb-3" style={{width:'fit-content'}}>
        Add Employee
      </Button>
      </div>

      {/* Add Employee Button */}
     

      {/* Employee List */}
     
      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark center-text">
          <tr style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>PAN</th>
            <th>Phone</th>
            <th>DOB</th>
            <th>Date of Joining</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee, index) => (
              <tr key={employee.employeeId}>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{index + 1}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{employee.name}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{employee.email}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{departments.find((dept) => dept.departmentId === employee.departmentId)?.departmentName || "-"}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{designations.find((designation) => designation.designationId === employee.designationId)?.designationName || "-"}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{employee.panNumber}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{employee.phoneNumber}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(employee.dob)}</td> {/* Format the DOB */}
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{formatDate(employee.dateOfJoining)}</td> {/* Format the DOJ */}
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }} >
                  <div style={{display:'flex',columnGap:'5px'}}>
                  <Button variant="warning" onClick={() => handleEdit(employee)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(employee)}>
                    Delete
                  </Button>
                  </div>
                  
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No employees found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Employee Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{form.employeeId ? "Edit Employee" : "Add Employee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name:</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    required={!form.employeeId} // Only required for new employees
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
             
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Department:</Form.Label>
                  <Form.Select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.departmentId} value={department.departmentId}>
                        {department.departmentName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth:</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Joining:</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfJoining"
                    value={form.dateOfJoining}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Designation:</Form.Label>
                  <Form.Select
                    name="designationId"
                    value={form.designationId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Designation</option>
                    {designations.map((designation) => (
                      <option key={designation.designationId} value={designation.designationId}>
                        {designation.designationName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>PAN Number:</Form.Label>
                  <Form.Control
                    type="text"
                    name="panNumber"
                    value={form.panNumber}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number:</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {form.employeeId ? (<></>) :(
              <>
            <Row>
            <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Basic Salary:</Form.Label>
                  <Form.Control
                    type="number"
                    name="basicSalary"
                    value={form.basicSalary}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>HRA:</Form.Label>
                  <Form.Control
                    type="text"
                    name="hra"
                    value={form.hra}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>DA:</Form.Label>
                  <Form.Control
                    type="text"
                    name="da"
                    value={form.da}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
            <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Salary Grade:</Form.Label>
                  <Form.Control
                    type="text"
                    name="salaryGrade"
                    value={form.salaryGrade}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bonus:</Form.Label>
                  <Form.Control
                    type="text"
                    name="bonus"
                    value={form.bonus}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

            </Row>
          </> ) }

            <Button variant="primary" type="submit">
              {form.employeeId ? "Update Employee" : "Add Employee"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmployeeSection;