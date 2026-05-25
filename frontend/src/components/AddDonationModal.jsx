import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AddDonationModal = ({ isOpen, onClose, onDonationAdded }) => {
  const { auth } = useAuth();
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("txn", transactionId);
    formData.append("category", paymentMethod);
    formData.append("date", new Date().toISOString().split("T")[0]);
    if (file) {
      formData.append("receipt", file);
    }

    try {
      await axios.post("/api/donations", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
      });
      onDonationAdded();
      onClose();
    } catch (err) {
      setError("Failed to add donation. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Add New Donation</h2>

        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Bank Account Details</h3>
          <p>
            <strong>Account Title:</strong> Md. Delwar Hossain, Dewan Md.
            Emdadul Hoque, Md. Kabir Hossain
          </p>
          <p>
            <strong>Account Number:</strong> 0200025481750
          </p>
          <p>
            <strong>Bank:</strong> Agrani Bank PLC.
          </p>
          <p>
            <strong>Branch:</strong> Amin Court Corporate Branch, Dhaka.
          </p>
          <hr className="my-4" />
          <h3 className="text-lg font-semibold mb-2">Mobile Banking</h3>
          <p>
            <strong>Treasurer:</strong> Md. Kabir Hossain
          </p>
          <p>
            <strong>Planning Editor:</strong> Md. Billal Hossain
          </p>
          <p>
            <strong>Bkash Number:</strong> 01760 227766
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option>Bank</option>
              <option>Bkash</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Receipt (Screenshot)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDonationModal;
