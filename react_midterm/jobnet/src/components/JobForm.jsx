
import { useState } from "react";

function JobForm({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !company.trim() || !location.trim()) {
      setError("Please fill in the title, company, and location.");
      return;
    }

    if (url && !/^https?:\/\//i.test(url)) {
      setError("The vacancy link must start with http:// or https://.");
      return;
    }

    onAdd({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      remote,
      url: url.trim(),
      tags: [],
      types: [],
      description: "This vacancy was added by the user.",
      createdAt: Math.floor(Date.now() / 1000),
      custom: true,
    });

    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="job-form"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="form-heading">
          <div>
            <span className="eyebrow">GROW YOUR NETWORK</span>
            <h2>Add an opportunity</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <label>
          Job title *
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Intern" />
        </label>

        <label>
          Company *
          <input value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Studio North" />
        </label>

        <label>
          Location *
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Almaty or Remote" />
        </label>

        <label>
          Application link
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..." />
        </label>

        <label className="form-checkbox">
          <input type="checkbox" checked={remote}
            onChange={(e) => setRemote(e.target.checked)} />
          Remote position
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="button button-primary form-submit" type="submit">
          Add opportunity →
        </button>
      </form>
    </div>
  );
}

export default JobForm;
