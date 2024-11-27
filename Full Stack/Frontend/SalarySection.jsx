import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

const SalarySection = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    basicSalary: "",
    hra: "",
    da: "",
    salaryGrade: "",
    bonus: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch salary details from API
  const fetchSalaries = async () => {
    try {
      const response = await axios.get("http://localhost:3000/salaries");
      setSalaries(response.data.salaries);
    } catch (err) {
      console.error("Error fetching salaries:", err);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/employees");
      setEmployees(response.data.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []);

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
      if (form.isEdit) {
        // Update salary
        await axios.put(`http://localhost:3000/updateSalary/${form.employeeId}`, form);
        setSuccess("Salary updated successfully!");
      } else {
        // Add new salary
        await axios.post("http://localhost:3000/addSalary", form);
        setSuccess("Salary added successfully!");
      }

      fetchSalaries(); // Refresh salary list
      handleCloseModal(); // Close modal
      setForm({
        employeeId: "",
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

  // Open modal for adding/editing salary
  const handleAddEdit = (salary = null) => {
    setForm({
      employeeId: salary?.employeeId || "",
      basicSalary: salary?.basicSalary || "",
      hra: salary?.hra || "",
      da: salary?.da || "",
      salaryGrade: salary?.salaryGrade || "",
      bonus: salary?.bonus || "",
      isEdit: !!salary,
    });
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Filter employees without existing salary
  const availableEmployees = employees.filter(
    (employee) => !salaries.some((salary) => salary.employeeId === employee.employeeId)
  );

  return (
    <Container className="mt-4">
      {/* Alerts */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h4>Salary List</h4>
        {/* <Button variant="primary" onClick={() => handleAddEdit(null)} className="mb-3" style={{ width: "fit-content" }}>
          Add Salary
        </Button> */}
      </div>

      {/* Salary List */}
      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Employee</th>
            <th>Basic Salary</th>
            <th>HRA</th>
            <th>DA</th>
            <th>Salary Grade</th>
            <th>Bonus</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.length > 0 ? (
            salaries.map((salary, index) => (
              <tr key={salary.employeeId}>
                <td>{index + 1}</td>
                <td>{salary.name}</td>
                <td>{salary.basicSalary}</td>
                <td>{salary.hra}</td>
                <td>{salary.da}</td>
                <td>{salary.salaryGrade}</td>
                <td>{salary.bonus}</td>
                <td>
                  <Button variant="warning" onClick={() => handleAddEdit(salary)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No salary details found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add/Edit Salary Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{form.isEdit ? "Edit Salary" : "Add Salary"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee:</Form.Label>
                  <Form.Select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleInputChange}
                    disabled={form.isEdit} // Disable employee selection in Edit mode
                    required
                  >
                    <option value="">Select Employee</option>
                    {(form.isEdit ? employees : availableEmployees).map((employee) => (
                      <option key={employee.employeeId} value={employee.employeeId}>
                        {employee.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
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
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>HRA:</Form.Label>
                  <Form.Control
                    type="number"
                    name="hra"
                    value={form.hra}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>DA:</Form.Label>
                  <Form.Control
                    type="number"
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
                    type="number"
                    name="bonus"
                    value={form.bonus}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit">
              {form.isEdit ? "Update Salary" : "Add Salary"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SalarySection;
