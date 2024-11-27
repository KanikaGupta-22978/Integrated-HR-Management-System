import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap';
import axios from 'axios';

const DepartmentSection = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    departmentName: '',
    description: '',
    designationId: '',
  });
  const [designationForm, setDesignationForm] = useState({
    designationName: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDesignationModal, setShowAddDesignationModal] = useState(false);
  const [showEditDesignationModal, setShowEditDesignationModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editingDesignationId, setEditingDesignationId] = useState(null);

  // Fetch departments, employees, and designations
  const fetchDepartments = async () => {
    try {
      const [deptResponse, empResponse, desigResponse] = await Promise.all([
        axios.get('http://localhost:3000/departments'),
        axios.get('http://localhost:3000/employees'),
        axios.get('http://localhost:3000/designations'),
      ]);
      setDepartments(deptResponse.data.departments);
      // setDepartments(deptResponse.data.data.departments);

      setEmployees(empResponse.data.employees);
      setDesignations(desigResponse.data.designations);
      console.error('No Error');
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleDesignationInputChange = (e) => {
    const { name, value } = e.target;
    setDesignationForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/addDepartment', form);
      setSuccess(response.data.message);
      fetchDepartments();
      setForm({
        departmentName: '',
        description: '',
        designationId: '',
      });
      setShowAddModal(false); // Close the modal after submitting
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the department.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedDept = { ...form, departmentId: editingDeptId };
      const response = await axios.put(`http://localhost:3000/updateDepartment/${editingDeptId}`, updatedDept);
      setSuccess(response.data.message);
      fetchDepartments();
      setShowEditModal(false); // Close the modal after submitting
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the department.');
    }
  };

  const handleAddDesignationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/addDesignation', designationForm);
      setSuccess(response.data.message);
      fetchDepartments();
      setDesignationForm({
        designationName: '',
        description: '',
      });
      setShowAddDesignationModal(false); // Close the modal after submitting
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the designation.');
    }
  };

  // const handleEditDesignationSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   setSuccess('');

  //   try {
  //     const updatedDesignation = { ...designationForm, designationId: editingDesignationId };
  //     const response = await axios.put(`http://localhost:3000/updateDesignation/${editingDesignationId}`, updatedDesignation);
  //     setSuccess(response.data.message);
  //     fetchDepartments();
  //     setShowEditDesignationModal(false); // Close the modal after submitting
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'An error occurred while updating the designation.');
  //   }
  // };

  const handleEditClick = (department) => {
    setEditingDeptId(department.departmentId);
    setForm({
      departmentName: department.departmentName,
      description: department.description,
      designationId: department.designationId,
    });
    setShowEditModal(true);
  };
  

  const handleDeleteClick = async (department) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the department: ${department.departmentName}?`
    );
  
    if (!confirmDelete) return;
  
    try {
      // Send DELETE request to API
      await axios.delete(`http://localhost:3000/deleteDepartment/${department.departmentId}`);
      setSuccess(`Department ${department.departmentName} deleted successfully.`);
  
      // Refresh the department list
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while deleting the department.");
    }
  };
  

  const handleEditDesignationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      const updatedDesignation = { ...designationForm, designationId: editingDesignationId };
      const response = await axios.put(`http://localhost:3000/updateDesignation/${editingDesignationId}`, updatedDesignation);
      setSuccess(response.data.message);
      fetchDepartments();
      setShowEditDesignationModal(false); // Close the modal after submitting
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the designation.');
    }
  };
  
  const handleDeleteDesignation = async (designation) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the designation: ${designation.designationName}?`
    );
  
    if (!confirmDelete) return;
  
    try {
      // Send DELETE request to API
      await axios.delete(`http://localhost:3000/deleteDesignation/${designation.designationId}`);
      setSuccess(`Designation ${designation.designationName} deleted successfully.`);
  
      // Refresh the department list
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while deleting the designation.");
    }
  };
  
  // Update Designation
  const handleUpdateDesignation = (designation) => {
    setEditingDesignationId(designation.designationId);
    setDesignationForm({
      designationName: designation.designationName,
      description: designation.description,
    });
    setShowEditDesignationModal(true);
  };

  // Find employee name by ID
  const getEmployeeName = (id) => {
    const employee = employees.find((emp) => emp.employeeId === id);
    return employee ? employee.name : 'N/A';
  };

  // Find designation name by ID
  const getDesignationName = (id) => {
    const designation = designations.find((desig) => desig.designationId === id);
    return designation ? designation.designationName : 'N/A';
  };

  return (
    <Container className="mt-4">
      {/* <h3 className="text-center mb-4">Department Section</h3> */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div style={{display:'flex', justifyContent:'space-between'}}>
      <h4>Department List</h4>
      <Button style={{width:'fit-content'}} variant="primary" onClick={() => setShowAddModal(true)}>
        Add New Department
      </Button>
      </div>
      
      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Department Name</th>
            <th>Description</th>
            {/* <th>Designation</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.length > 0 ? (
            departments.map((department, index) => (
              <tr key={department.departmentId}>
                <td>{index + 1}</td>
                <td>{department.departmentName}</td>
                <td>{department.description}</td>
                <td style={{display:'flex',columnGap:'5px'}}>
                  <Button variant="warning" onClick={() => handleEditClick(department)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteClick(department)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No departments found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      

      
      {/* Designation Table */}
      <div style={{display:'flex', justifyContent:'space-between',marginTop:'5%'}}>
      <h4>Designation List</h4>
      <Button style={{width:'fit-content'}}  variant="primary" onClick={() => setShowAddDesignationModal(true)} className="ml-2">
        Add New Designation
      </Button>
      </div>
      <Table striped bordered hover responsive className="mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Designation Name</th>
            <th>Description</th>
            <th>Actions</th>
            {/* <th>Actions</th>/ */}
          </tr>
        </thead>
        <tbody>
          {designations.length > 0 ? (
            designations.map((designation, index) => (
              <tr key={designation.designationId}>
                <td>{index + 1}</td>
                <td>{designation.designationName}</td>
                <td>{designation.description || 'N/A'}</td>
                <td style={{display:'flex',columnGap:'5px'}}>
            <Button
              variant="warning"
              onClick={() => handleUpdateDesignation(designation)}
              style={{ marginRight: '10px' }}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteDesignation(designation)}
            >
              Delete
            </Button>
          </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No designations found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Add Department Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="departmentName"
                    value={form.departmentName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                as="select"
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
              </Form.Control>
            </Form.Group> */}
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Department Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="departmentName"
                    value={form.departmentName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                as="select"
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
              </Form.Control>
            </Form.Group> */}
            <Button variant="primary" type="submit">
              Update
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Designation Modal */}
      <Modal show={showAddDesignationModal} onHide={() => setShowAddDesignationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Designation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddDesignationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Designation Name</Form.Label>
              <Form.Control
                type="text"
                name="designationName"
                value={designationForm.designationName}
                onChange={handleDesignationInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={designationForm.description}
                onChange={handleDesignationInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Designation Modal */}
      <Modal show={showEditDesignationModal} onHide={() => setShowEditDesignationModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Designation</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleEditDesignationSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Designation Name</Form.Label>
            <Form.Control
              type="text"
              name="designationName"
              value={designationForm.designationName}
              onChange={handleDesignationInputChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={designationForm.description}
              onChange={handleDesignationInputChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Button variant="primary" type="submit">
        Update
      </Button>
    </Form>
  </Modal.Body>
</Modal>
    </Container>
  );
};

export default DepartmentSection;
