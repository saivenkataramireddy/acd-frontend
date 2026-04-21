import React, { useState } from 'react';
import './ProfileForm.css';

const ProfileForm = ({ onComplete, initialData, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    fullName: '',
    bloodGroup: '',
    medicalNotes: '',
    contact1Name: '',
    contact1Phone: '',
    contact2Name: '',
    contact2Phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.contact1Phone || !formData.contact2Phone) {
      alert("Please fill in your name and both emergency contacts.");
      return;
    }
    localStorage.setItem('userProfile', JSON.stringify(formData));
    onComplete(formData);
  };

  return (
    <div className="profile-form-container">
      <div className="profile-form-card glass-panel">
        <h2 className="form-title">{initialData ? "Edit Profile" : "Welcome to Accident Response"}</h2>
        <p className="form-subtitle">{initialData ? "Update your emergency details below." : "Please set up your emergency profile to continue."}</p>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>Personal Details</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Jane Doe" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                  <option value="">Select...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group flex-2">
                <label>Medical Notes / Allergies</label>
                <input type="text" name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} placeholder="e.g. Penicillin allergy" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact 1</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Name *</label>
                <input type="text" name="contact1Name" value={formData.contact1Name} onChange={handleChange} required placeholder="John Doe" />
              </div>
              <div className="form-group flex-2">
                <label>WhatsApp / Phone Number *</label>
                <input type="tel" name="contact1Phone" value={formData.contact1Phone} onChange={handleChange} required placeholder="+12345678900" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact 2</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Name *</label>
                <input type="text" name="contact2Name" value={formData.contact2Name} onChange={handleChange} required placeholder="Mary Smith" />
              </div>
              <div className="form-group flex-2">
                <label>WhatsApp / Phone Number *</label>
                <input type="tel" name="contact2Phone" value={formData.contact2Phone} onChange={handleChange} required placeholder="+10987654321" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-submit">{initialData ? "Save Changes" : "Save Profile & Start App"}</button>
          
          {initialData && onCancel && (
             <button type="button" className="btn btn-cancel" style={{ width: '100%', padding: '12px', marginTop: '10px' }} onClick={onCancel}>
               Cancel
             </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
