import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";

const RecruitmentSection = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    jobId: "",
    jobType: "",
    jobTitle: "",
    departmentId: "",
    numberOfOpenings: "",
    applicationId: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/jobs");
      setJobs(response.data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/departments");
      setDepartments(response.data.departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add or Update Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (form.jobId) {
        await axios.put(`http://localhost:3000/updateJob/${form.jobId}`, form);
        setSuccess("Job updated successfully!");
      } else {
        await axios.post("http://localhost:3000/addJob", form);
        setSuccess("Job added successfully!");
      }
      fetchJobs();
      setShowModal(false);
      setForm({
        jobId: "",
        jobType: "",
        jobTitle: "",
        departmentId: "",
        numberOfOpenings: "",
        applicationId: "",
        isActive: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleEdit = (job) => {
    setForm({ ...job });
    setShowModal(true);
  };

  const handleAdd = () => {
    setForm({
      jobId: "",
      jobType: "",
      jobTitle: "",
      departmentId: "",
      numberOfOpenings: "",
      applicationId: "",
      isActive: true,
    });
    setShowModal(true);
  };

  return (
    <div className="mt-4">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <h4>Recruitment List</h4>
      <Button variant="primary" onClick={handleAdd} className="mb-3" style={{width:'fit-content'}}>
        Add Job
      </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Job Type</th>
            <th>Job Title</th>
            <th>Department</th>
            <th>Openings</th>
            <th>Application ID</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => (
            <tr key={job.jobId}>
              <td>{index + 1}</td>
              <td>{job.jobType}</td>
              <td>{job.jobTitle}</td>
              <td>
                {departments.find((d) => d.departmentId === job.departmentId)
                  ?.departmentName || "-"}
              </td>
              <td>{job.numberOfOpenings}</td>
              <td>{job.applicationId || "-"}</td>
              <td>{job.isActive ? "Active" : "Inactive"}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(job)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{form.jobId ? "Edit Job" : "Add Job"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Job Type</Form.Label>
              <Form.Control
                type="text"
                name="jobType"
                value={form.jobType}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="departmentId"
                value={form.departmentId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Number of Openings</Form.Label>
              <Form.Control
                type="number"
                name="numberOfOpenings"
                value={form.numberOfOpenings}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Application ID</Form.Label>
              <Form.Control
                type="text"
                name="applicationId"
                value={form.applicationId}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Active"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {form.jobId ? "Update" : "Add"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default RecruitmentSection;
