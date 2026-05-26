import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { upazilas, villagesByUpazila } from "../data/siteData";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  district: "Chandpur",
  division: "Chittagong",
  upazila: "",
  villageName: "",
  policeStation: "",
  mobileNumber: "",
  lastEducation: "",
  presentAddress: "",
  permanentAddress: "",
  dateOfBirth: "",
  politicalAffiliation: "No",
  certificateDocument: null,
  nidDocument: null,
  profileImage: null,
};

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sameAddress, setSameAddress] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();

  const villageOptions = form.upazila
    ? villagesByUpazila[form.upazila] || []
    : [];

  // Always auto-fill permanent address from location fields
  useEffect(() => {
    const parts = [form.villageName, form.policeStation, form.upazila, form.district, form.division].filter(Boolean);
    const address = parts.join(", ");
    setForm((prev) => ({
      ...prev,
      permanentAddress: address,
      ...(sameAddress ? { presentAddress: address } : {}),
    }));
  }, [sameAddress, form.villageName, form.policeStation, form.upazila, form.district, form.division]);

  const updateField = (name, value) => {
    setForm((current) => {
      if (name === "upazila") {
        return { ...current, upazila: value, villageName: "" };
      }

      return { ...current, [name]: value };
    });
  };

  const handleFile = (event) => {
    const { name, files } = event.target;
    updateField(name, files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value instanceof File) {
          payload.append(key, value);
        } else if (
          !["confirmPassword"].includes(key) &&
          value !== null &&
          value !== ""
        ) {
          payload.append(key, value);
        }
      });

      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(data.message || "Registration submitted for approval.");
      setForm(emptyForm);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-page">
      <div className="container register-shell">
        <div className="register-hero">
          <div className="register-hero-icon">
            <UserPlus />
          </div>
          <h1>Create Account</h1>
          <p>Join Chandpur Allumni Association- Jahangirnagar University today</p>
        </div>
        <form className="register-card" onSubmit={handleSubmit}>
          <div className="notice-box">
            Your account will be reviewed by an administrator before activation.
          </div>

          <div className="form-grid">
            <label>
              Full Name *
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                required
              />
            </label>
            <label>
              District
              <input type="text" value={form.district} readOnly disabled />
            </label>
            <label>
              Email Address *
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </label>
            <label>
              Division
              <input type="text" value={form.division} readOnly disabled />
            </label>
            <label>
              Password *
              <div className="pwd-wrap">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="pwd-eye"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            <label>
              Upazila *
              <select
                value={form.upazila}
                onChange={(event) => updateField("upazila", event.target.value)}
                required
              >
                <option value="">— Select Upazila —</option>
                {upazilas.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Confirm Password *
              <div className="pwd-wrap">
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="pwd-eye"
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                >
                  {showConfirmPwd ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            <label>
              Village Name *
              <select
                value={form.villageName}
                onChange={(event) =>
                  updateField("villageName", event.target.value)
                }
                disabled={!form.upazila}
                required
              >
                <option value="">
                  {form.upazila
                    ? "— Select Village —"
                    : "— Select Upazila First —"}
                </option>
                {villageOptions.map((village, index) => (
                  <option key={`${village}-${index}`} value={village}>
                    {village}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date of Birth *
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  updateField("dateOfBirth", event.target.value)
                }
                required
              />
            </label>
            <label>
              Union / Post Office *
              <input
                type="text"
                placeholder="Enter your Union / Post Office"
                value={form.policeStation}
                onChange={(event) =>
                  updateField("policeStation", event.target.value)
                }
                required
              />
            </label>
            <label>
              Mobile Number *
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={form.mobileNumber}
                onChange={(event) =>
                  updateField("mobileNumber", event.target.value)
                }
                required
              />
            </label>
            <label>
              Certificate Document *
              <input
                type="file"
                name="certificateDocument"
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFile}
                required
              />
            </label>
            <label>
              Last Education *
              <select
                value={form.lastEducation}
                onChange={(event) =>
                  updateField("lastEducation", event.target.value)
                }
                required
              >
                <option value="">— Select Education —</option>
                <option>Honours (Hons)</option>
                <option>Bachelor's Degree (BA/BSc/BBA)</option>
                <option>Master's Degree (MA/MSc/MBA)</option>
                <option>MPhil</option>
                <option>PhD / Doctorate</option>
                <option>Medical Degree (MBBS/BDS)</option>
                <option>Engineering Degree (BSc Engg)</option>
                <option>Law Degree (LLB/LLM)</option>
                <option>Diploma (Post-Hons)</option>
                <option>Other Higher Education</option>
              </select>
            </label>
            <label>
              National ID (NID) Document *
              <input
                type="file"
                name="nidDocument"
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFile}
                required
              />
            </label>
            <div className="full-span">
              <label className="perm-addr-label">
                Present Address *
                <label className="same-addr-check">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                  />
                  Same as permanent address
                </label>
              </label>
              <textarea
                rows="4"
                placeholder="Enter your current address"
                value={form.presentAddress}
                onChange={(event) =>
                  updateField("presentAddress", event.target.value)
                }
                required
              />
            </div>
            <label>
              Profile Image (Optional)
              <input
                type="file"
                name="profileImage"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleFile}
              />
            </label>
            <div className="full-span">
              <label className="perm-addr-label">
                Permanent Address *
              </label>
              <textarea
                rows="4"
                placeholder="Enter your permanent address"
                value={form.permanentAddress}
                onChange={(event) =>
                  updateField("permanentAddress", event.target.value)
                }
                disabled={sameAddress}
                required
              />
            </div>
          </div>

          <div className="radio-group">
            <div className="radio-title">Are you politically affiliated? *</div>
            <div className="poly-toggle">
              <button
                type="button"
                className={`poly-btn${form.politicalAffiliation === "No" ? " poly-btn--active" : ""}`}
                onClick={() => updateField("politicalAffiliation", "No")}
              >
                No
              </button>
              <button
                type="button"
                className={`poly-btn${form.politicalAffiliation === "Yes" ? " poly-btn--active" : ""}`}
                onClick={() => updateField("politicalAffiliation", "Yes")}
              >
                Yes
              </button>
            </div>
          </div>

          {message ? <div className="form-message error">{message}</div> : null}
          <button
            type="submit"
            className="primary-button full register-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="register-links">
            <span>Already have an account?</span>{" "}
            <Link to="/login">Login Here</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
