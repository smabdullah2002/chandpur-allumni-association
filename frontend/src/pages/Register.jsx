import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { upazilas } from "../data/siteData";

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
  profession: "",
  professionCustom: "",
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sameAddress, setSameAddress] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();

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
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      if (name === "profession" || name === "professionCustom") {
        delete nextErrors.profession;
        delete nextErrors.professionCustom;
      }
      return nextErrors;
    });
  };

  const handleFile = (event) => {
    const { name, files } = event.target;
    updateField(name, files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const professionValue =
      form.profession === "Custom" ? form.professionCustom.trim() : form.profession;

    const nextErrors = {};
    const requiredFields = [
      ["fullName", "Full name is required"],
      ["email", "Email address is required"],
      ["password", "Password is required"],
      ["confirmPassword", "Please confirm your password"],
      ["upazila", "Upazila is required"],
      ["villageName", "Village/Area name is required"],
      ["dateOfBirth", "Date of birth is required"],
      ["policeStation", "Union / Post Office is required"],
      ["mobileNumber", "Mobile number is required"],
      ["certificateDocument", "Certificate document is required"],
      ["lastEducation", "Last education is required"],
      ["profession", "Profession is required"],
      ["nidDocument", "National ID document is required"],
      ["presentAddress", "Present address is required"],
      ["permanentAddress", "Permanent address is required"],
    ];

    requiredFields.forEach(([fieldName, errorMessage]) => {
      if (!form[fieldName]) {
        nextErrors[fieldName] = errorMessage;
      }
    });

    if (form.profession === "Custom" && !professionValue) {
      nextErrors.professionCustom = "Custom profession is required";
      nextErrors.profession = "Profession is required";
    }

    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setMessage("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!professionValue) {
      setMessage("Please select or enter your profession");
      return;
    }

    setLoading(true);
    setMessage("");
    setFieldErrors({});

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "profession" || key === "professionCustom") {
          return;
        }
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

      payload.append("profession", professionValue);

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

  const fieldClassName = (fieldName) =>
    fieldErrors[fieldName] ? "register-field register-field--error" : "register-field";

  const fieldErrorText = (fieldName) => fieldErrors[fieldName] || "";

  return (
    <section className="register-page">
      <div className="container register-shell">
        <div className="register-hero">
          <div className="register-hero-icon">
            <UserPlus />
          </div>
          <h1>Create Account</h1>
          <p style={{ color: "white", fontSize: "20px" }}>
            Join Chandpur Allumni Association- Jahangirnagar University
          </p>
        </div>
        <form className="register-card" onSubmit={handleSubmit} noValidate>
          <div className="notice-box">
            Your account will be reviewed by an administrator before activation.
          </div>

          <div className="form-grid">
            <label className={fieldClassName("fullName")}>
              Full Name *
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                required
              />
              {fieldErrorText("fullName") ? <span className="field-error-text">{fieldErrorText("fullName")}</span> : null}
            </label>

            <label>
              District
              <input type="text" value={form.district} readOnly disabled />
            </label>

            <label className={fieldClassName("email")}>
              Email Address *
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
              {fieldErrorText("email") ? <span className="field-error-text">{fieldErrorText("email")}</span> : null}
            </label>

            <label>
              Division
              <input type="text" value={form.division} readOnly disabled />
            </label>

            <label className={fieldClassName("password")}>
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
              {fieldErrorText("password") ? <span className="field-error-text">{fieldErrorText("password")}</span> : null}
            </label>

            <label className={fieldClassName("upazila")}>
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
              {fieldErrorText("upazila") ? <span className="field-error-text">{fieldErrorText("upazila")}</span> : null}
            </label>

            <label className={fieldClassName("confirmPassword")}>
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
              {fieldErrorText("confirmPassword") ? <span className="field-error-text">{fieldErrorText("confirmPassword")}</span> : null}
            </label>

            <label className={fieldClassName("villageName")}>
              Village/Area Name *
              <input
                type="text"
                placeholder="Enter your village or area name"
                value={form.villageName}
                onChange={(event) => updateField("villageName", event.target.value)}
                required
              />
              {fieldErrorText("villageName") ? <span className="field-error-text">{fieldErrorText("villageName")}</span> : null}
            </label>

            <label className={fieldClassName("dateOfBirth")}>
              Date of Birth *
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
                required
              />
              {fieldErrorText("dateOfBirth") ? <span className="field-error-text">{fieldErrorText("dateOfBirth")}</span> : null}
            </label>

            <label className={fieldClassName("policeStation")}>
              Union / Post Office *
              <input
                type="text"
                placeholder="Enter your Union / Post Office"
                value={form.policeStation}
                onChange={(event) => updateField("policeStation", event.target.value)}
                required
              />
              {fieldErrorText("policeStation") ? <span className="field-error-text">{fieldErrorText("policeStation")}</span> : null}
            </label>

            <label className={fieldClassName("mobileNumber")}>
              Mobile Number *
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={form.mobileNumber}
                onChange={(event) => updateField("mobileNumber", event.target.value)}
                required
              />
              {fieldErrorText("mobileNumber") ? <span className="field-error-text">{fieldErrorText("mobileNumber")}</span> : null}
            </label>

            <label className={fieldClassName("certificateDocument")}>
              Certificate Document *
              <input
                type="file"
                name="certificateDocument"
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFile}
                required
              />
              {fieldErrorText("certificateDocument") ? <span className="field-error-text">{fieldErrorText("certificateDocument")}</span> : null}
            </label>

            <label className={fieldClassName("profession")}>
              Profession *
              <select
                value={form.profession}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    profession: event.target.value,
                    professionCustom:
                      event.target.value === "Custom" ? current.professionCustom : "",
                  }))
                }
                required
              >
                <option value="">— Select Profession —</option>
                <option>Teacher</option>
                <option>Doctor</option>
                <option>Engineer</option>
                <option>Government Service</option>
                <option>Business</option>
                <option>Farmer</option>
                <option>Lawyer</option>
                <option>Student</option>
                <option>Retired</option>
                <option>Homemaker</option>
                <option>Freelancer</option>
                <option>Custom</option>
              </select>
              {fieldErrorText("profession") ? <span className="field-error-text">{fieldErrorText("profession")}</span> : null}
            </label>

            {form.profession === "Custom" ? (
              <label className={fieldClassName("professionCustom")}>
                Custom Profession *
                <input
                  type="text"
                  placeholder="Enter your profession"
                  value={form.professionCustom}
                  onChange={(event) => updateField("professionCustom", event.target.value)}
                  required
                />
                {fieldErrorText("professionCustom") ? <span className="field-error-text">{fieldErrorText("professionCustom")}</span> : null}
              </label>
            ) : null}

            <label className={fieldClassName("lastEducation")}>
              Last Education *
              <select
                value={form.lastEducation}
                onChange={(event) => updateField("lastEducation", event.target.value)}
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
              {fieldErrorText("lastEducation") ? <span className="field-error-text">{fieldErrorText("lastEducation")}</span> : null}
            </label>

            <label className={fieldClassName("nidDocument")}>
              National ID (NID) Document *
              <input
                type="file"
                name="nidDocument"
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                onChange={handleFile}
                required
              />
              {fieldErrorText("nidDocument") ? <span className="field-error-text">{fieldErrorText("nidDocument")}</span> : null}
            </label>

            <div className={`full-span ${fieldErrors.presentAddress ? "register-field register-field--error" : ""}`}>
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
                onChange={(event) => updateField("presentAddress", event.target.value)}
                required
              />
              {fieldErrorText("presentAddress") ? <span className="field-error-text">{fieldErrorText("presentAddress")}</span> : null}
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

            <div className={`full-span ${fieldErrors.permanentAddress ? "register-field register-field--error" : ""}`}>
              <label className="perm-addr-label">
                Permanent Address *
              </label>
              <textarea
                rows="4"
                placeholder="Enter your permanent address"
                value={form.permanentAddress}
                onChange={(event) => updateField("permanentAddress", event.target.value)}
                disabled={sameAddress}
                required
              />
              {fieldErrorText("permanentAddress") ? <span className="field-error-text">{fieldErrorText("permanentAddress")}</span> : null}
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
