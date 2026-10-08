import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const CATEGORIES = ["Jewellery", "Painting", "Pottery", "Wood Art", "Home Decor", "Fashion"];

export default function AddProduct() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Jewellery");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotos((prev) => (prev.length >= 5 ? prev : [...prev, canvas.toDataURL("image/jpeg", 0.7)]));
      };
      img.onerror = () => alert("Photo load nahi hui, dusri photo try karein");
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (dataUrl, sig) => {
    const s = sig || await api.getUploadSignature();
    const fd = new FormData();
    fd.append("file", dataUrl);
    Object.entries(s).forEach(([k, v]) => { if (k !== "cloud_name") fd.append(k, v); });
    const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloud_name}/image/upload`, { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.secure_url) throw new Error((d.error && d.error.message) || "Photo upload failed");
    return d.secure_url;
  };

  const publish = async () => {
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    try {
    const sig = photos.length ? await api.getUploadSignature() : null;
    const photoUrls = [];
    for (const ph of photos) { photoUrls.push(await uploadPhoto(ph, sig)); }
    await api.createProduct({
      seller_id: user.id,
      title,
      description,
      price: parseFloat(price),
      is_negotiable: negotiable,
      category,
      photo: photoUrls[0] || null,
      photos: photoUrls,
    });
    navigate("/my-products");
    } catch (err) {
      busy.current = false;
      setSubmitting(false);
      alert("Product save nahi hua: " + (err && err.message ? err.message : String(err)));
    }
  };

  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}>←</span>
        <span style={{ fontWeight: 600 }}>Add Product ({step}/4)</span>
      </div>

      {step === 1 && (
        <div>
          <label className="field-label">Product Photos ({photos.length}/5)</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {photos.map((ph, i) => (
              <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                <img src={ph} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                <span onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, background: "#333", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>x</span>
              </div>
            ))}
          </div>
          <label className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, marginBottom: 20, cursor: "pointer", overflow: "hidden" }}>
            <span style={{ color: "var(--ink-soft)" }}>{photos.length < 5 ? "+ Add photo" : "Max 5 photos"}</span>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>
          <button className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="field">
            <label className="field-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Handmade Silver Earrings" />
          </div>
          <div className="field">
            <label className="field-label">Description</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Material, size, time taken to make..." />
          </div>
          <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!title}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="field-label">Category</label>
          <div className="chip-row" style={{ flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <div key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setStep(4)} style={{ marginTop: 12 }}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="field">
            <label className="field-label">Price (₹)</label>
            <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="899" />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} />
            Price is negotiable
          </label>
          <button className="btn btn-primary" onClick={publish} disabled={!price || submitting}>{submitting ? "Publishing..." : "Publish"}</button>
        </div>
      )}
    </div>
  );
}
