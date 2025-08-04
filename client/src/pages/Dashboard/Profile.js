import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import '../../css/profile.css';
import '../../css/dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Input = ({ label, ...rest }) => (
  <label className="mb-3">
    <span className="form-label">{label}</span>
    <input {...rest} className="form-control" />
  </label>
);

const Select = ({ label, name, value, onChange, options }) => (
  <label className="mb-3">
    <span className="form-label">{label}</span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="form-control"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const Profile = () => {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    gender: "",
    description: "",
    username: "",
    email: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [editing, setEditing] = useState(false);
  const [refreshTime, setRefreshTime] = useState(Date.now()); // 👈 added state
  const fileInputRef = useRef(null);

  const profileUrl = auth?.role === 'admin'
    ? '/dashboard/admin/profile'
    : '/dashboard/user/profile';

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get(profileUrl);
      setProfile({
        ...data,
        avatar: data.avatar ? `${API_URL}${data.avatar}` : null
      });
      setForm({
        fullName: data.fullName || "",
        bio: data.bio || "",
        gender: data.gender || "",
        description: data.description || "",
        username: data.username || "",
        email: data.email || "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load profile';
      setFormError(msg);
    }
  }, [profileUrl]);

  useEffect(() => {
    if (profileUrl) fetchProfile();
  }, [profileUrl, fetchProfile]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => setAvatar(e.target.files[0]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });
      if (avatar) {
        fd.append("avatar", avatar);
      }

      await api.put(profileUrl, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProfile();
      setRefreshTime(Date.now()); // 🔄 force avatar reload
      setEditing(false);
      setAvatar(null);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setFormError(msg);
    } finally {
      setTimeout(() => {
        setFormError('');
        setSuccessMsg('');
      }, 5000);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={auth?.role} />
      <main className="page-container dashboard-page">
        <h1 className="form-label mb-3">Profile</h1>

        {profile && !editing ? (
          <div className="profile-card">
            {formError && (
              <div className="popup-error">
                {formError}
                <button className="close-btn" onClick={() => setFormError('')}>×</button>
              </div>
            )}
            {successMsg && (
              <div className="popup-success">
                {successMsg}
                <button className="close-btn" onClick={() => setSuccessMsg('')}>×</button>
              </div>
            )}
            {profile.avatar ? (
              <img src={`${profile.avatar}?t=${refreshTime}`} alt="" className="profile-avatar" />
            ) : (
              <div className="profile-avatar fallback"></div>
            )}
            <p><strong>Username:</strong> {profile.username || "—"}</p>
            <p><strong>Email:</strong> {profile.email || "—"}</p>
            <p><strong>Name:</strong> {profile.fullName || "—"}</p>
            <p><strong>Bio:</strong> {profile.bio || "—"}</p>
            <p><strong>Gender:</strong> {profile.gender || "—"}</p>
            <p><strong>Description:</strong> {profile.description || "—"}</p>

            <button className="btn-primary" onClick={() => setEditing(true)}>
              Update Profile
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="profile-form profile-card"
            encType="multipart/form-data"
          >
            {formError && (
              <div className="popup-error">
                {formError}
                <button className="close-btn" onClick={() => setFormError('')}>×</button>
              </div>
            )}
            {successMsg && (
              <div className="popup-success">
                {successMsg}
                <button className="close-btn" onClick={() => setSuccessMsg('')}>×</button>
              </div>
            )}

            <div className="upload-label" onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
              {avatar ? (
                <img src={URL.createObjectURL(avatar)} alt="" className="profile-avatar" />
              ) : profile?.avatar ? (
                <img src={`${profile.avatar}?t=${refreshTime}`} alt="" className="profile-avatar" />
              ) : (
                <div className="profile-avatar fallback">Upload Avatar</div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: "none" }}
              />
              <span className="form-label">
                {profile?.avatar ? 'Click avatar to change' : 'Add a profile photo'}
              </span>
            </div>

            <Input name="username" label="Username" value={form.username || ""} onChange={handleChange} />
            <Input name="email" label="Email" value={form.email || ""} onChange={handleChange} />
            <Input name="fullName" label="Full Name" value={form.fullName || ""} onChange={handleChange} />
            <Input name="bio" label="Bio" value={form.bio || ""} onChange={handleChange} />
            <Select
              name="gender"
              label="Gender"
              value={form.gender || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "non-binary", label: "Non-binary" },
                { value: "prefer-not-to-say", label: "Prefer not to say" },
              ]}
            />
            <Input name="description" label="Description" value={form.description || ""} onChange={handleChange} />

            <button className="btn-primary">
              {profile ? "Save Changes" : "Add Profile"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default Profile;
