import { useState } from "react";
import { X, Plus, ImageIcon, Smartphone, Tablet, Watch, Headphones, Laptop } from "lucide-react";
import type { Device, DeviceSpecs, DevicePerformance } from "../data/devices";

interface AddDeviceModalProps {
  onClose: () => void;
  onAdd: (device: Device) => void;
  showToast: (msg: string) => void;
}

const CATEGORIES = [
  { id: "mobiles", label: "Phone", icon: <Smartphone className="size-4" /> },
  { id: "tablets", label: "Tablet", icon: <Tablet className="size-4" /> },
  { id: "watches", label: "Smartwatch", icon: <Watch className="size-4" /> },
  { id: "earbuds", label: "Earbuds", icon: <Headphones className="size-4" /> },
  { id: "laptops", label: "Laptop", icon: <Laptop className="size-4" /> },
] as const;

export default function AddDeviceModal({ onClose, onAdd, showToast }: AddDeviceModalProps) {
  // Basic info
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Device["category"]>("mobiles");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("4.5");
  const [imageUrl, setImageUrl] = useState("");

  // Key Specs
  const [displayTypeSize, setDisplayTypeSize] = useState("");
  const [chipset, setChipset] = useState("");
  const [gpu, setGpu] = useState("");
  const [os, setOs] = useState("");
  const [ram, setRam] = useState("");
  const [storageVariants, setStorageVariants] = useState("");
  const [mainCamera, setMainCamera] = useState("");
  const [selfieCamera, setSelfieCamera] = useState("");
  const [capacity, setCapacity] = useState("");
  const [wiredCharging, setWiredCharging] = useState("");
  const [wirelessCharging, setWirelessCharging] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [weight, setWeight] = useState("");
  const [bluetooth, setBluetooth] = useState("");
  const [wifi, setWifi] = useState("");
  const [resistance, setResistance] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [colors, setColors] = useState("");

  // Performance
  const [cpuScore, setCpuScore] = useState("");
  const [gpuScore, setGpuScore] = useState("");
  const [batteryLife, setBatteryLife] = useState("");
  const [antutuScore, setAntutuScore] = useState("");

  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Device name is required");
    if (!brand.trim()) errs.push("Brand is required");
    if (!price.trim()) errs.push("Price is required");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const id = `custom-${brand.toLowerCase().replace(/\s+/g, "-")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    // Auto-generate GSMArena image URL if none provided
    const autoImageSlug = `${brand.toLowerCase().replace(/\s+/g, "-")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-")}`;
    const finalImage = imageUrl.trim() || `https://fdn2.gsmarena.com/vv/bigpic/${autoImageSlug}.jpg`;

    const cpuVal = parseInt(cpuScore) || 3000;
    const gpuVal = parseInt(gpuScore) || 2500;
    const antutuVal = antutuScore.trim() || "0.45M";

    const specs: DeviceSpecs = {
      technology: "GSM / HSPA / LTE / 5G",
      bands5g: "Sub-6",
      dimensions: dimensions || "160.0 × 75.0 × 8.0 mm",
      weight: weight || "190 g",
      build: "Glass front, aluminum frame",
      sim: "Nano-SIM / eSIM",
      resistance: resistance || "No official rating",
      displayTypeSize: displayTypeSize || "6.5\" AMOLED, 120Hz",
      protection: "Gorilla Glass",
      peakBrightness: "1000 nits",
      pixelDensity: "400 ppi",
      chipset: chipset || "Unknown",
      gpu: gpu || "Unknown",
      os: os || "Android 15",
      ram: ram || "8 GB",
      storageVariants: storageVariants || "128 GB",
      cardSlot: "No",
      mainCamera: mainCamera || "50 MP",
      selfieCamera: selfieCamera || "16 MP",
      video: "4K@30fps",
      capacity: capacity || "5000 mAh",
      wiredCharging: wiredCharging || "25W",
      wirelessCharging: wirelessCharging || "No",
      wifi: wifi || "Wi-Fi 6",
      bluetooth: bluetooth || "5.3",
      nfcUsb: "Yes / USB-C 2.0",
      sensors: "Fingerprint, gyro, compass",
      colors: colors || "Black, White",
      releaseDate: releaseDate || new Date().getFullYear().toString()
    };

    const performance: DevicePerformance = {
      cpuScore: cpuVal,
      cpuPercent: Math.min(100, Math.round((cpuVal / 16000) * 100)),
      gpuScore: gpuVal,
      gpuPercent: Math.min(100, Math.round((gpuVal / 19000) * 100)),
      batteryLife: batteryLife || "12h",
      batteryPercent: 70,
      antutuScore: antutuVal,
      antutuPercent: Math.min(100, Math.round((parseFloat(antutuVal) || 0.4) * 35))
    };

    const newDevice: Device = {
      id,
      name: name.trim(),
      brand: brand.trim(),
      category,
      image: finalImage,
      price: price.startsWith("$") ? price : `$${price}`,
      rating: parseFloat(rating) || 4.5,
      specs,
      performance
    };

    onAdd(newDevice);
    showToast(`✅ ${name} added successfully!`);
    onClose();
  };

  const inputClass = "w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] transition-all";
  const labelClass = "text-xs font-semibold text-zinc-400 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-[#7f22fe]/10 to-transparent shrink-0">
          <div>
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Plus className="size-5 text-[#7f22fe]" />
              Add New Device
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Step {step} of 2 — {step === 1 ? "Basic Information" : "Specs & Performance"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          {[1, 2].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? "bg-[#7f22fe]" : "bg-zinc-800"}`} />
          ))}
        </div>

        {/* Form Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 flex flex-col gap-1">
              {errors.map(err => (
                <p key={err} className="text-xs text-red-400">• {err}</p>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              
              {/* Category Picker */}
              <div>
                <label className={labelClass}>Category <span className="text-[#7f22fe]">*</span></label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        category === cat.id
                          ? "bg-[#7f22fe]/15 border-[#7f22fe]/50 text-white"
                          : "bg-zinc-800/40 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Device Name <span className="text-[#7f22fe]">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Galaxy S25 Ultra" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Brand <span className="text-[#7f22fe]">*</span></label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Samsung" className={inputClass} />
                </div>
              </div>

              {/* Price & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price <span className="text-[#7f22fe]">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">$</span>
                    <input value={price} onChange={e => setPrice(e.target.value)} placeholder="799" className={inputClass + " pl-7"} type="number" min="0" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Rating (1.0 – 5.0)</label>
                  <input value={rating} onChange={e => setRating(e.target.value)} placeholder="4.5" className={inputClass} type="number" step="0.1" min="1" max="5" />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className={labelClass}>
                  <ImageIcon className="size-3 inline mr-1" />
                  Image URL <span className="text-zinc-500 font-normal">(optional — auto-uses GSMArena if blank)</span>
                </label>
                <input
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://fdn2.gsmarena.com/vv/bigpic/brand-model.jpg"
                  className={inputClass}
                />
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={imageUrl} alt="Preview" className="size-16 object-contain rounded-xl border border-white/10 bg-zinc-950 p-1" onError={e => (e.currentTarget.style.display = "none")} />
                    <span className="text-[10px] text-zinc-500">Image preview</span>
                  </div>
                )}
              </div>

              {/* Release Date & Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Release Date</label>
                  <input value={releaseDate} onChange={e => setReleaseDate(e.target.value)} placeholder="Jan 2025" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Colors</label>
                  <input value={colors} onChange={e => setColors(e.target.value)} placeholder="Black, White, Blue" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              
              {/* Display & Platform */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#7f22fe] font-extrabold mb-3">Display & Platform</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Display (Type / Size)</label>
                    <input value={displayTypeSize} onChange={e => setDisplayTypeSize(e.target.value)} placeholder='6.8" AMOLED 120Hz' className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Chipset</label>
                    <input value={chipset} onChange={e => setChipset(e.target.value)} placeholder="Snapdragon 8 Elite" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>GPU</label>
                    <input value={gpu} onChange={e => setGpu(e.target.value)} placeholder="Adreno 830" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Operating System</label>
                    <input value={os} onChange={e => setOs(e.target.value)} placeholder="Android 15, One UI 7" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#7f22fe] font-extrabold mb-3">Memory & Storage</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>RAM</label>
                    <input value={ram} onChange={e => setRam(e.target.value)} placeholder="12 GB / 16 GB" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Storage</label>
                    <input value={storageVariants} onChange={e => setStorageVariants(e.target.value)} placeholder="256 GB / 512 GB" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Camera */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#7f22fe] font-extrabold mb-3">Camera</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Main Camera</label>
                    <input value={mainCamera} onChange={e => setMainCamera(e.target.value)} placeholder="200 MP + 50 MP + 10 MP" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Selfie Camera</label>
                    <input value={selfieCamera} onChange={e => setSelfieCamera(e.target.value)} placeholder="12 MP" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Battery & Charging */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#7f22fe] font-extrabold mb-3">Battery & Connectivity</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Battery Capacity</label>
                    <input value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="5000 mAh" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Wired Charging</label>
                    <input value={wiredCharging} onChange={e => setWiredCharging(e.target.value)} placeholder="45W" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Wireless Charging</label>
                    <input value={wirelessCharging} onChange={e => setWirelessCharging(e.target.value)} placeholder="15W / No" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Water Resistance</label>
                    <input value={resistance} onChange={e => setResistance(e.target.value)} placeholder="IP68" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Wi-Fi</label>
                    <input value={wifi} onChange={e => setWifi(e.target.value)} placeholder="Wi-Fi 7" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Bluetooth</label>
                    <input value={bluetooth} onChange={e => setBluetooth(e.target.value)} placeholder="5.4" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions</label>
                    <input value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="163 × 75 × 8.6 mm" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Weight</label>
                    <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="218 g" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#00bc7d] font-extrabold mb-3">Performance Benchmarks</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CPU Score</label>
                    <input value={cpuScore} onChange={e => setCpuScore(e.target.value)} placeholder="12000" className={inputClass} type="number" />
                  </div>
                  <div>
                    <label className={labelClass}>GPU Score</label>
                    <input value={gpuScore} onChange={e => setGpuScore(e.target.value)} placeholder="15000" className={inputClass} type="number" />
                  </div>
                  <div>
                    <label className={labelClass}>Battery Life</label>
                    <input value={batteryLife} onChange={e => setBatteryLife(e.target.value)} placeholder="14h" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>AnTuTu Score</label>
                    <input value={antutuScore} onChange={e => setAntutuScore(e.target.value)} placeholder="1.85M" className={inputClass} />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-zinc-950/40 shrink-0 gap-3">
          <button
            onClick={onClose}
            className="text-sm px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-sm px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-all"
              >
                ← Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => { if (validate()) setStep(2); }}
                className="text-sm px-6 py-2.5 rounded-xl bg-[#7f22fe] hover:bg-[#7f22fe]/90 text-white font-bold cursor-pointer transition-all shadow-[0_0_15px_rgba(127,34,254,0.3)]"
              >
                Next: Specs →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="text-sm px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00bc7d] to-[#7f22fe] text-white font-extrabold cursor-pointer transition-all hover:opacity-90 shadow-[0_0_20px_rgba(0,188,125,0.25)]"
              >
                ✓ Add Device
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
