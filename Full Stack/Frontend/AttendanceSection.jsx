import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";

const AttendanceSection = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    attendanceId: "",
    employeeId: "",
    date: "",
    checkInTime: "",
    checkOutTime: "",
    lateArrival: false,
    earlyDeparture: false,
    shiftTime: "",
    workingHours: 0.0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchRecords = async () => {
    try {
      const response = await axios.get("http://localhost:3000/attendance");
      setRecords(response.data.records);
    } catch (err) {
      console.error("Error fetching attendance records:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/employees");
      setEmployees(response.data.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (form.attendanceId) {
        await axios.put(`http://localhost:3000/updateAttendance/${form.attendanceId}`, form);
        setSuccess("Attendance record updated successfully!");
      } else {
        await axios.post("http://localhost:3000/addAttendance", form);
        setSuccess("Attendance record added successfully!");
      }
      fetchRecords();
      setShowModal(false);
      setForm({
        attendanceId: "",
        employeeId: "",
        date: "",
        checkInTime: "",
        checkOutTime: "",
        lateArrival: false,
        earlyDeparture: false,
        shiftTime: "",
        workingHours: 0.0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleEdit = (record) => {
    setForm({ ...record });
    setShowModal(true);
  };

  const handleAdd = () => {
    setForm({
      attendanceId: "",
      employeeId: "",
      date: "",
      checkInTime: "",
      checkOutTime: "",
      lateArrival: false,
      earlyDeparture: false,
      shiftTime: "",
      workingHours: 0.0,
    });
    setShowModal(true);
  };

  return (
    <div className="mt-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4>Attendance Records</h4>
        {/* <Button variant="primary" onClick={handleAdd}>Add Attendance</Button> */}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Late Arrival</th>
            <th>Early Departure</th>
            <th>Shift</th>
            <th>Working Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.attendanceId}>
              <td>{index + 1}</td>
              <td>{employees.find((e) => e.employeeId === record.employeeId)?.name || "Unknown"}</td>
              <td>{new Date(record.date).toLocaleDateString()}</td>
              <td>{record.checkInTime}</td>
              <td>{record.checkOutTime || "-"}</td>
              <td>{record.lateArrival ? "Yes" : "No"}</td>
              <td>{record.earlyDeparture ? "Yes" : "No"}</td>
              <td>{record.shiftTime}</td>
              <td>{record.workingHours}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{form.attendanceId ? "Edit Attendance" : "Add Attendance"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Employee</Form.Label>
              <Form.Select name="employeeId" value={form.employeeId} onChange={handleInputChange} required>
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" value={form.date} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Check-In Time</Form.Label>
              <Form.Control type="time" name="checkInTime" value={form.checkInTime} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Check-Out Time</Form.Label>
              <Form.Control type="time" name="checkOutTime" value={form.checkOutTime} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Check type="checkbox" label="Late Arrival" name="lateArrival" checked={form.lateArrival} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Check type="checkbox" label="Early Departure" name="earlyDeparture" checked={form.earlyDeparture} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Shift Time</Form.Label>
              <Form.Control type="text" name="shiftTime" value={form.shiftTime} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Working Hours</Form.Label>
              <Form.Control type="number" step="0.1" name="workingHours" value={form.workingHours} onChange={handleInputChange} />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">{form.attendanceId ? "Update" : "Add"} Attendance</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AttendanceSection;
