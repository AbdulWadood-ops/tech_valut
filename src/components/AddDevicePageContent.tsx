'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ArrowLeft,
  Star,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  Laptop,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Device } from '../data/devices';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { id: 'mobiles' as const, label: 'Phone', icon: <Smartphone className="size-4" /> },
  { id: 'tablets' as const, label: 'Tablet', icon: <Tablet className="size-4" /> },
  { id: 'watches' as const, label: 'Smartwatch', icon: <Watch className="size-4" /> },
  { id: 'earbuds' as const, label: 'Earbuds', icon: <Headphones className="size-4" /> },
  { id: 'laptops' as const, label: 'Laptop', icon: <Laptop className="size-4" /> }
];

export default function AddDevicePageContent() {
  const router = useRouter();
  const { showToast } = useApp();

  // Navigation Tabs for Form
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'performance'>('basic');

  // Basic info state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Device['category']>('mobiles');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('4.5');
  const [imageUrl, setImageUrl] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [colors, setColors] = useState('');
  const [buyUrl, setBuyUrl] = useState('');

  // Spec fields state
  const [technology, setTechnology] = useState('');
  const [bands5g, setBands5g] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [build, setBuild] = useState('');
  const [sim, setSim] = useState('');
  const [resistance, setResistance] = useState('');
  const [displayTypeSize, setDisplayTypeSize] = useState('');
  const [protection, setProtection] = useState('');
  const [peakBrightness, setPeakBrightness] = useState('');
  const [pixelDensity, setPixelDensity] = useState('');
  const [chipset, setChipset] = useState('');
  const [gpu, setGpu] = useState('');
  const [os, setOs] = useState('');
  const [ram, setRam] = useState('');
  const [storageVariants, setStorageVariants] = useState('');
  const [cardSlot, setCardSlot] = useState('');
  const [mainCamera, setMainCamera] = useState('');
  const [selfieCamera, setSelfieCamera] = useState('');
  const [video, setVideo] = useState('');
  const [capacity, setCapacity] = useState('');
  const [wiredCharging, setWiredCharging] = useState('');
  const [wirelessCharging, setWirelessCharging] = useState('');
  const [wifi, setWifi] = useState('');
  const [bluetooth, setBluetooth] = useState('');
  const [nfcUsb, setNfcUsb] = useState('');
  const [sensors, setSensors] = useState('');

  // Performance state
  const [cpuScore, setCpuScore] = useState('');
  const [gpuScore, setGpuScore] = useState('');
  const [batteryLife, setBatteryLife] = useState('');
  const [antutuScore, setAntutuScore] = useState('');

  // Form State
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [addedDeviceDetails, setAddedDeviceDetails] = useState<Device | null>(null);

  // Auto-fill template values based on category
  const applyCategoryTemplate = () => {
    if (category === 'mobiles') {
      setTechnology('GSM / HSPA / LTE / 5G');
      setBands5g('Sub-6 + mmWave');
      setDimensions('161.0 × 74.0 × 8.2 mm');
      setWeight('195 g');
      setBuild('Glass front, aluminum frame, glass back');
      setSim('Nano-SIM + eSIM');
      setResistance('IP68 dust/water resistant (up to 1.5m for 30 min)');
      setDisplayTypeSize('6.7" AMOLED, 120Hz LTPO');
      setProtection('Corning Gorilla Glass Victus 2');
      setPeakBrightness('2600 nits');
      setPixelDensity('450 ppi');
      setChipset('Snapdragon 8 Gen 3 (4nm)');
      setGpu('Adreno 750');
      setOs('Android 15, Custom OS');
      setRam('12 GB / 16 GB');
      setStorageVariants('256 GB / 512 GB');
      setCardSlot('No');
      setMainCamera('50 MP + 50 MP + 12 MP Triple');
      setSelfieCamera('32 MP');
      setVideo('4K@60fps, 1080p@240fps');
      setCapacity('5000 mAh');
      setWiredCharging('67W wired, 100% in 35 mins');
      setWirelessCharging('15W wireless');
      setWifi('Wi-Fi 7');
      setBluetooth('5.4, A2DP, LE');
      setNfcUsb('Yes / USB Type-C 3.2, OTG');
      setSensors('Fingerprint (under display, optical), accelerometer, gyro, proximity, compass');
      setCpuScore('9800');
      setGpuScore('14500');
      setBatteryLife('13h');
      setAntutuScore('1.75M');
      setColors('Obsidian Grey, Arctic Silver');
      setReleaseDate('Jan 2025');
    } else if (category === 'tablets') {
      setTechnology('Wi-Fi Only (or 5G option)');
      setBands5g('Sub-6 (Cellular models)');
      setDimensions('285.4 × 185.4 × 5.7 mm');
      setWeight('580 g');
      setBuild('Glass front, aluminum frame, aluminum back');
      setSim('No (or eSIM option)');
      setResistance('IP68 water resistant');
      setDisplayTypeSize('12.4" Dynamic AMOLED 2X, 120Hz');
      setProtection('Scratch-resistant glass');
      setPeakBrightness('1200 nits');
      setPixelDensity('266 ppi');
      setChipset('Snapdragon 8 Gen 2 (4nm)');
      setGpu('Adreno 740');
      setOs('Android 14, Tablet UI');
      setRam('8 GB / 12 GB');
      setStorageVariants('128 GB / 256 GB');
      setCardSlot('Yes (dedicated microSDXC)');
      setMainCamera('13 MP + 8 MP Dual');
      setSelfieCamera('12 MP Ultra-wide');
      setVideo('4K@30fps, 1080p@30fps');
      setCapacity('10090 mAh');
      setWiredCharging('45W wired');
      setWirelessCharging('No');
      setWifi('Wi-Fi 6E');
      setBluetooth('5.3');
      setNfcUsb('No / USB Type-C 3.2, magnetic connector');
      setSensors(
        'Fingerprint (under display), accelerometer, gyro, proximity, compass, stylus support (magnetic)'
      );
      setCpuScore('8800');
      setGpuScore('11000');
      setBatteryLife('11.5h');
      setAntutuScore('1.45M');
      setColors('Graphite, Silver');
      setReleaseDate('Mar 2024');
    } else if (category === 'watches') {
      setTechnology('LTE / Bluetooth / GPS');
      setBands5g('N/A');
      setDimensions('45.4 × 45.4 × 10.5 mm');
      setWeight('46 g');
      setBuild('Sapphire crystal glass front, titanium case');
      setSim('eSIM');
      setResistance('IP68 + 5ATM water resistant (50m)');
      setDisplayTypeSize('1.4" Super AMOLED display');
      setProtection('Sapphire crystal');
      setPeakBrightness('2000 nits');
      setPixelDensity('327 ppi');
      setChipset('Exynos W930 (5nm)');
      setGpu('Mali-G68');
      setOs('Wear OS 4, Watch UI');
      setRam('2 GB');
      setStorageVariants('16 GB');
      setCardSlot('No');
      setMainCamera('No');
      setSelfieCamera('No');
      setVideo('No');
      setCapacity('425 mAh');
      setWiredCharging('15W wireless (Qi)');
      setWirelessCharging('Yes');
      setWifi('Wi-Fi 2.4/5GHz');
      setBluetooth('5.3, LE');
      setNfcUsb('Yes / NFC only');
      setSensors(
        'Accelerometer, gyro, heart rate, barometer, compass, SpO2, skin temperature, ECG'
      );
      setCpuScore('2200');
      setGpuScore('0');
      setBatteryLife('40 hours');
      setAntutuScore('N/A');
      setColors('Titanium Black, Titanium Grey');
      setReleaseDate('Aug 2024');
    } else if (category === 'earbuds') {
      setTechnology('Bluetooth Only');
      setBands5g('N/A');
      setDimensions('21.8 × 20.6 × 24.4 mm (earbud)');
      setWeight('5.4 g (each earbud)');
      setBuild('Plastic, silicone tips');
      setSim('No');
      setResistance('IPX7 sweat & waterproof (earbuds only)');
      setDisplayTypeSize('N/A');
      setProtection('N/A');
      setPeakBrightness('N/A');
      setPixelDensity('N/A');
      setChipset('Custom H2 Headphone Chip');
      setGpu('N/A');
      setOs('Custom RTOS');
      setRam('N/A');
      setStorageVariants('N/A');
      setCardSlot('No');
      setMainCamera('No');
      setSelfieCamera('No');
      setVideo('No');
      setCapacity('Battery charging case included');
      setWiredCharging('USB-C charging case');
      setWirelessCharging('MagSafe / Qi wireless charging case');
      setWifi('No');
      setBluetooth('5.3, AAC, SBC codecs');
      setNfcUsb('USB-C port on charging case');
      setSensors('Touch control, skin-detect sensors, accelerometer (motion/speech)');
      setCpuScore('1200');
      setGpuScore('0');
      setBatteryLife('6h (30h with case)');
      setAntutuScore('N/A');
      setColors('White, Graphite');
      setReleaseDate('Oct 2024');
    } else if (category === 'laptops') {
      setTechnology('Wi-Fi Only (cellular option available)');
      setBands5g('N/A');
      setDimensions('312.6 × 221.2 × 15.5 mm');
      setWeight('1.4 kg');
      setBuild('Aluminum unibody construction');
      setSim('No');
      setResistance('N/A');
      setDisplayTypeSize('14.2" Liquid Retina XDR, 120Hz ProMotion');
      setProtection('Scratch-resistant glass');
      setPeakBrightness('1600 nits (HDR peak)');
      setPixelDensity('254 ppi');
      setChipset('Apple M3 Pro (11-core CPU)');
      setGpu('14-core GPU');
      setOs('macOS Sonoma');
      setRam('18 GB unified memory');
      setStorageVariants('512 GB SSD');
      setCardSlot('Yes (SDXC card slot)');
      setMainCamera('No (1080p FaceTime HD camera)');
      setSelfieCamera('No');
      setVideo('1085p video calls');
      setCapacity('72.4 Wh Li-Po battery');
      setWiredCharging('70W USB-C power adapter');
      setWirelessCharging('No');
      setWifi('Wi-Fi 6E (802.11ax)');
      setBluetooth('5.3');
      setNfcUsb('MagSafe 3, 3x Thunderbolt 4 (USB-C), HDMI, 3.5mm jack');
      setSensors('Ambient light sensor, Touch ID fingerprint reader');
      setCpuScore('11500');
      setGpuScore('13800');
      setBatteryLife('16h');
      setAntutuScore('N/A');
      setColors('Space Black, Silver');
      setReleaseDate('Nov 2023');
    }
    showToast(`🪄 Loaded template for ${category === 'mobiles' ? 'Phone' : category}!`);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Device Name is required');
    if (!brand.trim()) errs.push('Brand is required');
    if (!price.trim()) errs.push('Price is required');

    const rateNum = parseFloat(rating);
    if (isNaN(rateNum) || rateNum < 1.0 || rateNum > 5.0) {
      errs.push('Rating must be a number between 1.0 and 5.0');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    setIsLoading(true);

    // Formulate final fields
    const formattedId = `${brand.toLowerCase().replace(/\s+/g, '-')}-${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
    const cleanPrice = price.startsWith('$') ? price.trim() : `$${price.trim()}`;
    const cleanRating = parseFloat(rating) || 4.5;

    const defaultImage =
      imageUrl.trim() ||
      `https://fdn2.gsmarena.com/vv/bigpic/${brand.toLowerCase()}-${name
        .toLowerCase()
        .replace(/\s+/g, '-')}.jpg`;

    // Benchmarks parsing
    const cScore =
      parseInt(cpuScore) ||
      (category === 'earbuds' ? 1200 : category === 'watches' ? 2000 : 4000);
    const gScore =
      parseInt(gpuScore) ||
      (category === 'earbuds' || category === 'watches' ? 0 : 3500);
    const bLife =
      batteryLife.trim() ||
      (category === 'watches' ? '40 hours' : category === 'earbuds' ? '6h' : '12h');
    const aScore =
      antutuScore.trim() ||
      (category === 'earbuds' || category === 'watches' ? 'N/A' : '0.58M');

    // Performance Percentages (Scale based on flagship thresholds)
    const cpuPct = Math.min(100, Math.round((cScore / 16000) * 100));
    const gpuPct = Math.min(100, Math.round((gScore / 19000) * 100));
    const batPct = category === 'watches' ? 85 : category === 'earbuds' ? 90 : 75;

    let aPct = 0;
    if (aScore !== 'N/A') {
      const parsedAntutu = parseFloat(aScore.replace(/[^0-9.]/g, '')) || 0.5;
      aPct = Math.min(100, Math.round(parsedAntutu * 35));
    }

    const deviceData: Device = {
      id: formattedId,
      name: name.trim(),
      brand: brand.trim(),
      category,
      image: defaultImage,
      price: cleanPrice,
      rating: cleanRating,
      specs: {
        technology: technology.trim() || 'GSM / HSPA / LTE / 5G',
        bands5g: bands5g.trim() || 'Sub-6',
        dimensions: dimensions.trim() || '160.0 × 75.0 × 8.0 mm',
        weight: weight.trim() || '190 g',
        build: build.trim() || 'Glass front, aluminum frame, plastic back',
        sim: sim.trim() || 'Nano-SIM / eSIM',
        resistance: resistance.trim() || 'No official IP rating',
        displayTypeSize: displayTypeSize.trim() || '6.5" AMOLED, 120Hz',
        protection: protection.trim() || 'Glass',
        peakBrightness: peakBrightness.trim() || '1000 nits',
        pixelDensity: pixelDensity.trim() || '400 ppi',
        chipset: chipset.trim() || 'Octa-core SoC',
        gpu: gpu.trim() || 'Integrated GPU',
        os: os.trim() || 'Custom OS',
        ram: ram.trim() || '8 GB',
        storageVariants: storageVariants.trim() || '128 GB',
        cardSlot: cardSlot.trim() || 'No',
        mainCamera: mainCamera.trim() || '50 MP Main',
        selfieCamera: selfieCamera.trim() || '12 MP Front',
        video: video.trim() || '1080p@30fps',
        capacity: capacity.trim() || '5000 mAh',
        wiredCharging: wiredCharging.trim() || '25W wired',
        wirelessCharging: wirelessCharging.trim() || 'No',
        wifi: wifi.trim() || 'Wi-Fi 6',
        bluetooth: bluetooth.trim() || '5.3',
        nfcUsb: nfcUsb.trim() || 'Yes / USB-C 2.0',
        sensors: sensors.trim() || 'Fingerprint, accelerometer, gyro, proximity',
        colors: colors.trim() || 'Black, White',
        releaseDate: releaseDate.trim() || new Date().getFullYear().toString()
      },
      performance: {
        cpuScore: cScore,
        cpuPercent: cpuPct,
        gpuScore: gScore,
        gpuPercent: gpuPct,
        batteryLife: bLife,
        batteryPercent: batPct,
        antutuScore: aScore,
        antutuPercent: aPct
      },
      buyUrl: buyUrl.trim() || undefined
    };

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deviceData)
      });

      const result = await response.json();
      if (result.success) {
        setAddedDeviceDetails(deviceData);
        setIsSuccess(true);
        showToast(`🎉 Added ${deviceData.name} to project database!`);
      } else {
        setErrors([result.error || 'Failed to save device data in project database.']);
      }
    } catch (err: any) {
      setErrors([err.message || 'Network error. Make sure your server is active.']);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreviewStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="size-3.5 fill-[#fe9a00] text-[#fe9a00]" />);
      } else {
        stars.push(<Star key={i} className="size-3.5 text-zinc-650" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const getPreviewTheme = (cat: string) => {
    switch (cat) {
      case 'mobiles':
        return {
          text: 'text-[#00bc7d]',
          bg: 'bg-[#00bc7d]/10',
          border: 'border-[#00bc7d]/20',
          hoverBorder: 'hover:border-[#00bc7d]/40',
          shadow: 'hover:shadow-[#00bc7d]/5',
          imgGlow: 'bg-[#00bc7d]/5',
          btn: 'bg-[#00bc7d] text-white'
        };
      case 'tablets':
        return {
          text: 'text-[#3b82f6]',
          bg: 'bg-[#3b82f6]/10',
          border: 'border-[#3b82f6]/20',
          hoverBorder: 'hover:border-[#3b82f6]/40',
          shadow: 'hover:shadow-[#3b82f6]/5',
          imgGlow: 'bg-[#3b82f6]/5',
          btn: 'bg-[#3b82f6] text-white'
        };
      case 'watches':
        return {
          text: 'text-[#ad46ff]',
          bg: 'bg-[#ad46ff]/10',
          border: 'border-[#ad46ff]/20',
          hoverBorder: 'hover:border-[#ad46ff]/40',
          shadow: 'hover:shadow-[#ad46ff]/5',
          imgGlow: 'bg-[#ad46ff]/5',
          btn: 'bg-[#ad46ff] text-white'
        };
      case 'earbuds':
        return {
          text: 'text-[#fe9a00]',
          bg: 'bg-[#fe9a00]/10',
          border: 'border-[#fe9a00]/20',
          hoverBorder: 'hover:border-[#fe9a00]/40',
          shadow: 'hover:shadow-[#fe9a00]/5',
          imgGlow: 'bg-[#fe9a00]/5',
          btn: 'bg-[#fe9a00] text-white'
        };
      case 'laptops':
      default:
        return {
          text: 'text-[#ff3b30]',
          bg: 'bg-[#ff3b30]/10',
          border: 'border-[#ff3b30]/20',
          hoverBorder: 'hover:border-[#ff3b30]/40',
          shadow: 'hover:shadow-[#ff3b30]/5',
          imgGlow: 'bg-[#ff3b30]/5',
          btn: 'bg-[#ff3b30] text-white'
        };
    }
  };

  const pTheme = getPreviewTheme(category);
  const tempImageUrl =
    imageUrl.trim() ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';

  const formInputClass =
    'w-full bg-zinc-900 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder-zinc-500 outline-none focus:border-[#7f22fe] focus:bg-zinc-900/90 transition-all';
  const formLabelClass =
    'text-[11px] font-bold text-zinc-400 mb-1.5 block uppercase tracking-wide';

  if (isSuccess && addedDeviceDetails) {
    return (
      <div className="flex flex-1 w-full items-center justify-center p-8 bg-zinc-950 min-h-[calc(100vh-64px)] relative">
        <div className="absolute w-[400px] h-[400px] bg-[#00bc7d]/5 rounded-full blur-[100px] top-1/4 pointer-events-none" />
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative z-10 animate-fade-in">
          <CheckCircle2 className="size-16 text-[#00bc7d] mb-4 animate-bounce" />
          <h2 className="text-xl font-extrabold text-white mb-2">Device Written to Database!</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            The new model <span className="text-[#00bc7d] font-bold">{addedDeviceDetails.name}</span> has been written directly to the database. The website will dynamically display this device in listings and search tools.
          </p>

          {/* Miniature preview card in success screen */}
          <div className="w-56 rounded-xl border border-white/5 bg-zinc-950/60 p-3.5 mb-6 text-left">
            <img
              src={addedDeviceDetails.image}
              alt={addedDeviceDetails.name}
              className="h-24 w-full object-contain mb-3"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
              }}
            />
            <span
              className={`text-[8px] uppercase tracking-wider font-extrabold ${pTheme.text} px-2 py-0.5 rounded bg-zinc-900`}
            >
              {addedDeviceDetails.brand}
            </span>
            <h4 className="text-xs font-bold text-white mt-1.5 truncate">
              {addedDeviceDetails.name}
            </h4>
            <span className="text-xs font-bold text-[#00bc7d] mt-1 block">
              {addedDeviceDetails.price}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 w-full">
            <button
              onClick={() => {
                setIsSuccess(false);
                setName('');
                setPrice('');
                setImageUrl('');
                // Clear specs
                setChipset('');
                setDisplayTypeSize('');
                setRam('');
                setStorageVariants('');
                setCpuScore('');
                setGpuScore('');
              }}
              className="py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-all"
            >
              Add Another
            </button>
            <button
              onClick={() => {
                router.push(`/devices?category=${category}`);
              }}
              className="py-2.5 rounded-xl bg-gradient-to-r from-[#00bc7d] to-[#7f22fe] text-white text-xs font-extrabold cursor-pointer transition-all hover:opacity-95"
            >
              Go to Devices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-zinc-950 text-neutral-50 flex flex-col md:flex-row gap-6 p-6 min-h-[calc(100vh-64px)] relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10 hidden xl:block">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>
      </div>

      {/* LEFT COLUMN - REAL TIME LIVE CARD PREVIEW */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-5 justify-start md:pt-10">
        <div className="border-b border-white/5 pb-3">
          <h2 className="text-xs uppercase font-extrabold text-[#9f9fa9] tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-4 text-[#7f22fe] animate-pulse" />
            Live Grid Preview
          </h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            See exactly how it looks on the site in real-time
          </p>
        </div>

        {/* Live Preview Card Box */}
        <div
          className={`group rounded-2xl bg-zinc-900/40 border border-white/5 p-4 flex flex-col justify-between ${pTheme.hoverBorder} hover:bg-zinc-900/60 transition-all duration-300 relative shadow-lg ${pTheme.shadow} max-w-sm mx-auto md:w-full min-h-[340px]`}
        >
          <div>
            {/* Image Wrapper */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900/60 border border-white/5 mb-4 p-3 flex items-center justify-center relative">
              <div className={`blur-xl rounded-full ${pTheme.imgGlow} absolute inset-4 opacity-70`} />
              <img
                src={tempImageUrl}
                alt="Preview"
                className="relative object-contain max-h-28 w-auto transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                }}
              />
            </div>

            {/* Brand & Stars */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[9px] uppercase tracking-widest font-extrabold ${pTheme.text} ${pTheme.bg} border ${pTheme.border} px-2 py-0.5 rounded-full`}
              >
                {brand || 'Brand'}
              </span>
              {renderPreviewStars(parseFloat(rating) || 4.5)}
            </div>

            <h3 className="font-extrabold text-neutral-100 text-sm mb-1 truncate">
              {name || 'Device Model Name'}
            </h3>

            {/* Spec pills preview */}
            <div className="flex flex-wrap gap-1 mt-2 mb-1.5">
              {category === 'mobiles' && (
                <>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {chipset.trim()
                      ? chipset.split('(')[0].replace('Snapdragon', 'SD').trim()
                      : 'Octa-core SoC'}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {ram.trim()
                      ? `${ram.split('/')[0].trim()} • ${storageVariants.split('/')[0].trim()}`
                      : '8 GB • 128 GB'}
                  </span>
                </>
              )}
              {category === 'laptops' && (
                <>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {chipset.trim() ? chipset.split('(')[0].trim() : 'M3 / Intel Core'}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {ram.trim() ? ram : '16 GB RAM'}
                  </span>
                </>
              )}
              {category === 'watches' && (
                <>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {displayTypeSize.trim()
                      ? displayTypeSize.replace('display', '').trim()
                      : '1.4" AMOLED'}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {resistance.trim() ? resistance.split('(')[0].trim() : 'IP68 water resistant'}
                  </span>
                </>
              )}
              {category === 'earbuds' && (
                <>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {bluetooth.trim() ? `Bluetooth ${bluetooth}` : 'Bluetooth 5.3'}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {batteryLife.trim() ? `Battery: ${batteryLife}` : 'Battery: 6 hours'}
                  </span>
                </>
              )}
              {category === 'tablets' && (
                <>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {displayTypeSize.trim() ? displayTypeSize.split(',')[0].trim() : '11" AMOLED'}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-950 border border-white/5 px-2 py-0.5 rounded truncate max-w-full">
                    {chipset.trim() ? chipset.split('(')[0].trim() : 'Snapdragon SoC'}
                  </span>
                </>
              )}
            </div>

            <p className="text-[9px] text-[#9f9fa9] bg-zinc-950/40 px-2 py-0.5 rounded border border-white/5 inline-block mt-1">
              Released: {releaseDate || 'Latest'}
            </p>
          </div>

          {/* Pricing and Action Buttons */}
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9f9fa9]">Price</span>
              <span className="font-extrabold text-[#00bc7d] text-base">
                {price ? (price.startsWith('$') ? price : `$${price}`) : '$799'}
              </span>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-white/10 bg-zinc-950 text-neutral-300 font-bold cursor-not-allowed"
              >
                + Compare
              </button>
              {buyUrl.trim() && (
                <button
                  type="button"
                  className={`flex-1 text-xs py-1.5 px-2 rounded-lg ${pTheme.btn} font-bold cursor-not-allowed`}
                >
                  Buy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informative Tip Box */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-4 flex gap-3 text-zinc-400 text-[11px] leading-relaxed">
          <Sparkles className="size-5 text-[#00bc7d] shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-200">Database Auto-Sync:</strong> Any submission writes directly to the backend database JSON. It persists permanently on the server side.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - TABBED FORM CONTROLS */}
      <div className="flex-1 max-w-3xl bg-zinc-900/40 border border-white/5 rounded-3xl p-6 flex flex-col shadow-xl">
        {/* Form Title & Auto-fill Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 mb-5 gap-3">
          <div>
            <h1 className="text-xl font-black text-neutral-50 flex items-center gap-2">
              <Plus className="size-5 text-[#7f22fe]" />
              Register New Model
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add hardware spec sheets directly to the database
            </p>
          </div>
          <button
            type="button"
            onClick={applyCategoryTemplate}
            className="flex items-center gap-1 text-[10px] uppercase font-extrabold text-[#00bc7d] bg-[#00bc7d]/10 hover:bg-[#00bc7d]/15 border border-[#00bc7d]/35 px-3 py-1.5 rounded-full cursor-pointer transition-all self-start sm:self-center"
          >
            <Sparkles className="size-3 fill-[#00bc7d] stroke-none" />
            Auto-fill Template
          </button>
        </div>

        {/* Tab navigation headers */}
        <div className="flex border-b border-white/5 pb-3 mb-5 shrink-0 gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-[#7f22fe]/10 border-[#7f22fe]/35 text-[#ad46ff]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            1. Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'specs'
                ? 'bg-[#7f22fe]/10 border-[#7f22fe]/35 text-[#ad46ff]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            2. Detailed Specs ({category})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'performance'
                ? 'bg-[#7f22fe]/10 border-[#7f22fe]/35 text-[#ad46ff]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            3. Benchmark Scores
          </button>
        </div>

        {/* Validation Errors banner */}
        {errors.length > 0 && (
          <div className="mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex gap-3 text-red-400">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-left">
              <span className="text-xs font-extrabold uppercase">Please check form errors:</span>
              {errors.map((err, i) => (
                <p key={i} className="text-xs">
                  • {err}
                </p>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between text-left">
          <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2 flex flex-col gap-5">
            {/* TAB 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <div className="flex flex-col gap-5">
                {/* Category selection */}
                <div>
                  <label className={formLabelClass}>
                    Category Select <span className="text-[#7f22fe]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-[#7f22fe]/15 border-[#7f22fe]/50 text-white'
                            : 'bg-zinc-800/40 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelClass}>
                      Device Model Name <span className="text-[#7f22fe]">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Galaxy S26 Ultra"
                      className={formInputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>
                      Brand <span className="text-[#7f22fe]">*</span>
                    </label>
                    <input
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="e.g. Samsung"
                      className={formInputClass}
                      required
                    />
                  </div>
                </div>

                {/* Price & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelClass}>
                      Price (USD) <span className="text-[#7f22fe]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">
                        $
                      </span>
                      <input
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="e.g. 1199"
                        type="number"
                        min="0"
                        className={formInputClass + ' pl-7'}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={formLabelClass}>User Rating (1.0 - 5.0)</label>
                    <input
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      placeholder="e.g. 4.8"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      className={formInputClass}
                    />
                  </div>
                </div>

                {/* Image URL & Release Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelClass}>Image URL (Optional)</label>
                    <input
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="Leave blank for auto search"
                      className={formInputClass}
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>Release Date</label>
                    <input
                      value={releaseDate}
                      onChange={e => setReleaseDate(e.target.value)}
                      placeholder="e.g. Jan 2025"
                      className={formInputClass}
                    />
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className={formLabelClass}>Colors Available</label>
                  <input
                    value={colors}
                    onChange={e => setColors(e.target.value)}
                    placeholder="e.g. Titanium Black, Titanium Grey"
                    className={formInputClass}
                  />
                </div>

                {/* Buy URL */}
                <div>
                  <label className={formLabelClass}>Official Buy URL (Optional)</label>
                  <input
                    type="url"
                    value={buyUrl}
                    onChange={e => setBuyUrl(e.target.value)}
                    placeholder="e.g. https://store.apple.com/..."
                    className={formInputClass}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">If set, a &quot;Buy Now&quot; button will appear on this device&apos;s cards and detail pages.</p>
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED SPECS SHEET */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelClass}>Network Tech</label>
                  <input
                    value={technology}
                    onChange={e => setTechnology(e.target.value)}
                    placeholder="e.g. GSM / HSPA / LTE / 5G"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>5G Bands</label>
                  <input
                    value={bands5g}
                    onChange={e => setBands5g(e.target.value)}
                    placeholder="e.g. Sub-6 / N/A"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Dimensions</label>
                  <input
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="e.g. 161.0 × 74.0 × 8.2 mm"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Weight</label>
                  <input
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 195 g"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Build materials</label>
                  <input
                    value={build}
                    onChange={e => setBuild(e.target.value)}
                    placeholder="e.g. Glass front, titanium frame"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>SIM Type</label>
                  <input
                    value={sim}
                    onChange={e => setSim(e.target.value)}
                    placeholder="e.g. eSIM / Dual Nano-SIM"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Water/Dust Protection</label>
                  <input
                    value={resistance}
                    onChange={e => setResistance(e.target.value)}
                    placeholder="e.g. IP68 dust/water resistant"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Display Size / Type</label>
                  <input
                    value={displayTypeSize}
                    onChange={e => setDisplayTypeSize(e.target.value)}
                    placeholder={'e.g. 6.7" AMOLED, 120Hz'}
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Glass Protection</label>
                  <input
                    value={protection}
                    onChange={e => setProtection(e.target.value)}
                    placeholder="e.g. Gorilla Glass Armor"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Peak Brightness</label>
                  <input
                    value={peakBrightness}
                    onChange={e => setPeakBrightness(e.target.value)}
                    placeholder="e.g. 2600 nits"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Pixel Density</label>
                  <input
                    value={pixelDensity}
                    onChange={e => setPixelDensity(e.target.value)}
                    placeholder="e.g. 450 ppi"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Processor (Chipset)</label>
                  <input
                    value={chipset}
                    onChange={e => setChipset(e.target.value)}
                    placeholder="e.g. Snapdragon 8 Gen 3 (4nm)"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Graphics (GPU)</label>
                  <input
                    value={gpu}
                    onChange={e => setGpu(e.target.value)}
                    placeholder="e.g. Adreno 750"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Operating System (OS)</label>
                  <input
                    value={os}
                    onChange={e => setOs(e.target.value)}
                    placeholder="e.g. Android 15"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>System Memory (RAM)</label>
                  <input
                    value={ram}
                    onChange={e => setRam(e.target.value)}
                    placeholder="e.g. 12 GB / 16 GB"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Storage Capacity</label>
                  <input
                    value={storageVariants}
                    onChange={e => setStorageVariants(e.target.value)}
                    placeholder="e.g. 256 GB / 512 GB"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Card slot expansion</label>
                  <input
                    value={cardSlot}
                    onChange={e => setCardSlot(e.target.value)}
                    placeholder="e.g. Yes (microSDXC) / No"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Main Camera setup</label>
                  <input
                    value={mainCamera}
                    onChange={e => setMainCamera(e.target.value)}
                    placeholder="e.g. 50 MP Triple"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Selfie Camera setup</label>
                  <input
                    value={selfieCamera}
                    onChange={e => setSelfieCamera(e.target.value)}
                    placeholder="e.g. 12 MP"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Video capturing specs</label>
                  <input
                    value={video}
                    onChange={e => setVideo(e.target.value)}
                    placeholder="e.g. 4K@60fps, 1080p@240fps"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Battery Capacity</label>
                  <input
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    placeholder="e.g. 5000 mAh"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Wired Charging Speed</label>
                  <input
                    value={wiredCharging}
                    onChange={e => setWiredCharging(e.target.value)}
                    placeholder="e.g. 67W wired, 100% in 35m"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Wireless Charging Speed</label>
                  <input
                    value={wirelessCharging}
                    onChange={e => setWirelessCharging(e.target.value)}
                    placeholder="e.g. 15W wireless / No"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Wireless (Wi-Fi)</label>
                  <input
                    value={wifi}
                    onChange={e => setWifi(e.target.value)}
                    placeholder="e.g. Wi-Fi 7"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>Bluetooth spec</label>
                  <input
                    value={bluetooth}
                    onChange={e => setBluetooth(e.target.value)}
                    placeholder="e.g. 5.4, A2DP"
                    className={formInputClass}
                  />
                </div>
                <div>
                  <label className={formLabelClass}>NFC / USB version</label>
                  <input
                    value={nfcUsb}
                    onChange={e => setNfcUsb(e.target.value)}
                    placeholder="e.g. Yes / USB Type-C 3.2"
                    className={formInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={formLabelClass}>Sensors list</label>
                  <input
                    value={sensors}
                    onChange={e => setSensors(e.target.value)}
                    placeholder="e.g. Fingerprint (under display), accelerometer, gyro, compass"
                    className={formInputClass}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: BENCHMARK PERFORMANCE SCORES */}
            {activeTab === 'performance' && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelClass}>CPU Benchmark Score (Integer)</label>
                    <input
                      value={cpuScore}
                      onChange={e => setCpuScore(e.target.value)}
                      placeholder="e.g. 9800 (Max: ~16000)"
                      type="number"
                      className={formInputClass}
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>GPU Benchmark Score (Integer)</label>
                    <input
                      value={gpuScore}
                      onChange={e => setGpuScore(e.target.value)}
                      placeholder="e.g. 14500 (Max: ~19000)"
                      type="number"
                      className={formInputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelClass}>AnTuTu Performance Score</label>
                    <input
                      value={antutuScore}
                      onChange={e => setAntutuScore(e.target.value)}
                      placeholder="e.g. 1.75M / N/A"
                      className={formInputClass}
                    />
                  </div>
                  <div>
                    <label className={formLabelClass}>Active Battery Life (Hours)</label>
                    <input
                      value={batteryLife}
                      onChange={e => setBatteryLife(e.target.value)}
                      placeholder="e.g. 13h / 40 hours"
                      className={formInputClass}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save buttons */}
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'performance') setActiveTab('specs');
                  else if (activeTab === 'specs') setActiveTab('basic');
                }}
                className="py-2.5 px-5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-zinc-800 text-xs font-bold cursor-pointer transition-all"
              >
                Back
              </button>
            )}

            {activeTab !== 'performance' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'basic') {
                    if (validate()) setActiveTab('specs');
                  } else if (activeTab === 'specs') {
                    setActiveTab('performance');
                  }
                }}
                className="py-2.5 px-5 rounded-xl bg-[#7f22fe] hover:bg-[#7f22fe]/90 text-white text-xs font-extrabold cursor-pointer transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#00bc7d] to-[#7f22fe] text-white text-xs font-extrabold cursor-pointer transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isLoading ? 'Registering...' : 'Save & Register Model'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
