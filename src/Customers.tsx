import { useEffect, useState } from "react";
import "./Customers.css";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomersProps {
  onBackToDashboard?: () => void;
}

function Customers({ onBackToDashboard }: CustomersProps) {
  // =========================
  // STATE
  // =========================

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMERS
  // =========================

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/customers",
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

        throw new Error("Failed to load customers");
      }

      const data: Customer[] = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error("Customer loading error:", error);

      if (
        error instanceof Error &&
        error.message === "Unauthorized"
      ) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError("Unable to load customers.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");

    setEditingCustomer(null);
    setShowForm(false);
    setError("");
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");

    setEditingCustomer(null);
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SAVE CUSTOMER
  // =========================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter customer email.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter customer phone.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter customer address.");
      return;
    }

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    const customerData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      const url = editingCustomer
        ? `http://localhost:8080/api/customers/${editingCustomer.id}`
        : "http://localhost:8080/api/customers";

      const method = editingCustomer
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Customer save error:",
          message
        );

        if (response.status === 409) {
          setError(
            "A customer with this email already exists."
          );
          return;
        }

        if (response.status === 401) {
          setError(
            "Session expired. Please login again."
          );
          return;
        }

        throw new Error("Failed to save customer");
      }

      await loadCustomers();

      resetForm();
    } catch (error) {
      console.error("Save customer error:", error);

      setError(
        "Unable to save customer. Please try again."
      );
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);

    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setAddress(customer.address);

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/customers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();

        console.error(
          "Customer delete error:",
          message
        );

        throw new Error("Delete failed");
      }

      await loadCustomers();

      // If the deleted customer was being edited
      if (editingCustomer?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      setError(
        "Unable to delete customer."
      );
    }
  };

  // =========================
  // PAGE
  // =========================

  return (
    <div className="customer-admin-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="customer-admin-header">

        <div className="customer-admin-heading">
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
          <h1>Customers</h1>

          <p>
            Manage hotel customers
          </p>
        </div>

        <button
          className="customer-admin-primary"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              openAddForm();
            }
          }}
        >
          {showForm
            ? "Close"
            : "+ Add Customer"}
        </button>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="customer-admin-error">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =========================
          CUSTOMER FORM
      ========================= */}

      {showForm && (
        <div className="customer-admin-form-card">

          <h2>
            {editingCustomer
              ? "Edit Customer"
              : "Add New Customer"}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* TWO COLUMN GRID */}

            <div className="customer-admin-form-grid">

              {/* NAME */}

              <div className="customer-admin-form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter customer name"
                />

              </div>

              {/* EMAIL */}

              <div className="customer-admin-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter email"
                />

              </div>

              {/* PHONE */}

              <div className="customer-admin-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                />

              </div>

              {/* ADDRESS */}

              <div className="customer-admin-form-group">

                <label>
                  Address
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Enter address"
                />

              </div>

            </div>

            {/* BUTTONS */}

            <div className="customer-admin-form-actions">

              <button
                type="submit"
                className="customer-admin-primary"
              >
                {editingCustomer
                  ? "Update Customer"
                  : "Add Customer"}
              </button>

              {editingCustomer && (
                <button
                  type="button"
                  className="customer-admin-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="customer-admin-loading">
          Loading customers...
        </div>
      )}

      {/* =========================
          CUSTOMER LIST
      ========================= */}

      {!loading && (
        <div className="customer-admin-grid">

          {customers.length === 0 ? (

            <div className="customer-admin-empty">

              <div className="customer-admin-empty-icon">
                CU
              </div>

              <h2>
                No customers found
              </h2>

              <p>
                Add your first customer.
              </p>

            </div>

          ) : (

            customers.map((customer) => (

              <div
                className="customer-admin-card"
                key={customer.id}
              >

                {/* CUSTOMER HEADER */}

                <div className="customer-admin-card-header">

                  <div className="customer-admin-avatar">
                    CU
                  </div>

                  <div>

                    <h2>
                      {customer.name}
                    </h2>

                    <span>
                      Customer #{customer.id}
                    </span>

                  </div>

                </div>

                {/* CUSTOMER INFORMATION */}

                <div className="customer-admin-info">

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {customer.email}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {customer.phone}
                  </p>

                  <p>
                    <strong>
                      Address:
                    </strong>{" "}
                    {customer.address}
                  </p>

                </div>

                {/* ACTION BUTTONS */}

                <div className="customer-admin-actions">

                  <button
                    className="customer-admin-edit"
                    onClick={() =>
                      handleEdit(customer)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="customer-admin-delete"
                    onClick={() =>
                      handleDelete(customer.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>
      )}

    </div>
  );
}

export default Customers;