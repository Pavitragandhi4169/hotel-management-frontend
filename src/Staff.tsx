import { useEffect, useState } from "react";
import "./Staff.css";

interface Staff {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface StaffProps {
  onBackToDashboard?: () => void;
}

function Staff({ onBackToDashboard }: StaffProps) {
  const [staff, setStaff] = useState<Staff[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("RECEPTIONIST");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/staff",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }

        if (response.status === 403) {
          throw new Error("Access denied");
        }

        throw new Error("Failed to load staff");
      }

      const data = await response.json();

      setStaff(data);
    } catch (error) {
      console.error("Staff loading error:", error);

      if (
        error instanceof Error &&
        error.message === "Unauthorized"
      ) {
        setError(
          "Session expired. Please logout and login again."
        );
      } else if (
        error instanceof Error &&
        error.message === "Access denied"
      ) {
        setError(
          "You do not have permission to manage staff."
        );
      } else {
        setError("Unable to load staff.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("RECEPTIONIST");

    setEditingStaff(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    const staffData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
    };

    try {
      setError("");

      const url = editingStaff
        ? `http://localhost:8080/api/staff/${editingStaff.id}`
        : "http://localhost:8080/api/staff";

      const method = editingStaff ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }

        if (response.status === 403) {
          throw new Error("Access denied");
        }

        throw new Error("Failed to save staff");
      }

      await loadStaff();
      resetForm();
    } catch (error) {
      console.error("Save staff error:", error);

      if (
        error instanceof Error &&
        error.message === "Unauthorized"
      ) {
        setError(
          "Session expired. Please logout and login again."
        );
      } else if (
        error instanceof Error &&
        error.message === "Access denied"
      ) {
        setError(
          "You do not have permission to manage staff."
        );
      } else {
        setError("Unable to save staff.");
      }
    }
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);

    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone);
    setRole(member.role);

    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id?: number) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/staff/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }

        if (response.status === 403) {
          throw new Error("Access denied");
        }

        throw new Error("Failed to delete staff");
      }

      await loadStaff();
    } catch (error) {
      console.error("Delete staff error:", error);

      if (
        error instanceof Error &&
        error.message === "Unauthorized"
      ) {
        setError(
          "Session expired. Please logout and login again."
        );
      } else if (
        error instanceof Error &&
        error.message === "Access denied"
      ) {
        setError(
          "You do not have permission to delete staff."
        );
      } else {
        setError("Unable to delete staff.");
      }
    }
  };

  return (
    <div className="staff-page">

      {/* HEADER */}
      <div className="staff-header">

        <div className="staff-heading">
          {onBackToDashboard && (
            <button
              type="button"
              className="admin-back-dashboard"
              onClick={onBackToDashboard}
            >
              <span aria-hidden="true">←</span>
              Dashboard
            </button>
          )}
          <h1>Staff Management</h1>

          <p>
            Manage hotel staff members
          </p>
        </div>

        <button
          className="staff-add-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Staff
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="staff-error">
          {error}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="staff-form">

          <h2>
            {editingStaff
              ? "Edit Staff"
              : "Add Staff"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="staff-form-grid">

              <div className="staff-form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter staff name"
                />

              </div>

              <div className="staff-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter staff email"
                />

              </div>

              <div className="staff-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                />

              </div>

              <div className="staff-form-group">

                <label>
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option value="RECEPTIONIST">
                    RECEPTIONIST
                  </option>

                  <option value="MANAGER">
                    MANAGER
                  </option>

                  <option value="HOUSEKEEPING">
                    HOUSEKEEPING
                  </option>

                  <option value="CHEF">
                    CHEF
                  </option>

                  <option value="SECURITY">
                    SECURITY
                  </option>
                </select>

              </div>

            </div>

            <div className="staff-form-actions">

              <button
                type="submit"
                className="staff-save-button"
              >
                {editingStaff
                  ? "Update Staff"
                  : "Add Staff"}
              </button>

              <button
                type="button"
                className="staff-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* STAFF TABLE */}
      <div className="staff-table-card">

        <h2>
          Staff Members
        </h2>

        {loading ? (
          <p>
            Loading staff...
          </p>
        ) : staff.length === 0 ? (
          <p>
            No staff members found.
          </p>
        ) : (

          <div className="staff-table-wrapper">

            <table className="staff-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {staff.map((member) => (

                  <tr key={member.id}>

                    <td>
                      {member.id}
                    </td>

                    <td>
                      {member.name}
                    </td>

                    <td>
                      {member.email}
                    </td>

                    <td>
                      {member.phone}
                    </td>

                    <td>

                      <span className="staff-role">
                        {member.role}
                      </span>

                    </td>

                    <td>

                      <button
                        className="staff-edit-button"
                        onClick={() =>
                          handleEdit(member)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="staff-delete-button"
                        onClick={() =>
                          handleDelete(member.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Staff;