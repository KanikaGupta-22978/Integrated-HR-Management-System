import React from "react";
import EmployeeSection from "./EmployeeSection";
import DepartmentSection from "./DepartmentSection";
import AttendanceSection from "./AttendanceSection";
import RecruitmentSection from "./RecruitmentSection";
import SalarySection from "./SalarySection";

const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState("employee");

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">HR Management System</h2>
      <ul className="nav nav-tabs justify-content-center">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "employee" ? "active" : ""}`}
            onClick={() => setActiveTab("employee")}
          >
            Employees
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "dept" ? "active" : ""}`}
            onClick={() => setActiveTab("dept")}
          >
            Deptartment & Designation
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "recruitment" ? "active" : ""}`}
            onClick={() => setActiveTab("recruitment")}
          >
            Recruitment
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "SalarySection" ? "active" : ""}`}
            onClick={() => setActiveTab("SalarySection")}
          >
            Salary
          </button>
        </li>
      </ul>

      <div className="mt-4">
        {activeTab === "employee" && <EmployeeSection />}
        {activeTab === "dept" && <DepartmentSection />}
        {activeTab === "recruitment" && <RecruitmentSection />}
        {activeTab === "attendance" && <AttendanceSection />}
        {activeTab === "SalarySection" && <SalarySection />}
      </div>
    </div>
  );
};

export default Dashboard;
    