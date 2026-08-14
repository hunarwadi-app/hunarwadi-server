import { useState } from "react";
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
  const [photo, setPhoto] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    await api.createProduct({
      seller_id: user.id,
      title,
      description,
      price: parseFloat(price),
      is_negotiable: negotiable,
      category,
      photo,
    });
    navigate("/my-products");
  };

  return (
    <div className="screen">
      <div className="top-bar">
        <span className="back" onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}>←</span>
        <span style={{ fontWeight: 600 }}>Add Product ({step}/4)</span>
      </div>

      {step === 1 && (
        <div>
          <label className="field-label">Product Photo</label>
          <label className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, marginBottom: 20, cursor: "pointer", overflow: "hidden" }}>
            {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "var(--ink-soft)" }}>📷 Tap to upload photo</span>}
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
          <button className="btn btn-primary" onClick={publish} disabled={!price}>Publish</button>
        </div>
      )}
    </div>
  );
}
