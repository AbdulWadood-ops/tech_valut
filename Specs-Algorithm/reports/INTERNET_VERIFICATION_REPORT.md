# 🌐 Ground-Truth Internet Verification Report

**Audit Date:** Sun, 13 Sep 2026 14:41:21 GMT  
**Algorithm:** C++ Levenshtein String Distance & Numeric Relative Tolerance Engine  
**Overall Accuracy Percentage:** **86.32%**  

---

## 📊 Verified Accuracy by Device

| Device | Brand | Accuracy Score | Fields Checked | Discrepancies Flagged | Status |
|---|---|---|---|---|---|
| **Apple iPhone 15 Pro Max** | Apple | **79%** | 10 | 3 | 🟢 HIGH ACCURACY |
| **Apple iPad Pro 13 (M4)** | Apple | **100%** | 11 | 0 | 🟢 HIGH ACCURACY |
| **Samsung Galaxy S24** | Samsung | **93.8%** | 11 | 1 | 🟢 HIGH ACCURACY |
| **Google Pixel 8 Pro** | Google | **76.2%** | 11 | 4 | 🟢 HIGH ACCURACY |
| **OnePlus 12** | OnePlus | **83.7%** | 11 | 3 | 🟢 HIGH ACCURACY |
| **Xiaomi 14 Ultra** | Xiaomi | **73.3%** | 11 | 5 | 🟡 MODERATE |
| **Asus ROG Phone 8 Pro** | Asus | **92.3%** | 11 | 1 | 🟢 HIGH ACCURACY |
| **Sony Xperia 1 VI** | Sony | **92.3%** | 11 | 1 | 🟢 HIGH ACCURACY |

---

## 🔍 Field-by-Field Breakdown Analysis

### Apple iPhone 15 Pro Max (79% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `camera_main` | text | "48 MP (wide, sensor-shift OIS) + 12 MP (5x periscope telephoto) + 12 MP (ultrawide)" | "48 MP, f/1.8, 24mm (wide), 1/1.28\" | 21.7% | ⚠️ YES |
| `chipset` | text | "Apple A17 Pro (3 nm)" | "Apple A17 Pro (3 nm)" | 100.0% | ✅ NO |
| `display` | text | "Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision, 6.7 inches" | "6.7-inch Super Retina XDR OLED, 120Hz ProMotion, HDR10, Dolby Vision" | 70.4% | ⚠️ YES |
| `os` | text | "iOS 17, upgradable to iOS 18" | "iOS 17, upgradable to iOS 18" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP68 dust/water resistant (up to 6m for 30 mins)" | "IP68 dust/water resistant (up to 6m for 30 min)" | 97.9% | ✅ NO |
| `battery_mah` | numeric | "4441" | "4441" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "8" | "8" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "120" | "6.7" | 0.0% | ⚠️ YES |
| `storage_gb` | numeric | "256" | "256" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "221" | "221" | 100.0% | ✅ NO |

### Apple iPad Pro 13 (M4) (100% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Glass front, aluminum back, aluminum frame" | "Glass front, aluminum back, aluminum frame" | 100.0% | ✅ NO |
| `camera_main` | text | "12 MP, f/1.8 (wide), LiDAR scanner" | "12 MP, f/1.8 (wide), LiDAR scanner" | 100.0% | ✅ NO |
| `chipset` | text | "Apple M4 (9/10-core CPU)" | "Apple M4 (9/10-core CPU)" | 100.0% | ✅ NO |
| `display` | text | "Ultra Retina XDR OLED, 13.0 inches, 120Hz ProMotion" | "Ultra Retina XDR OLED, 13.0 inches, 120Hz ProMotion" | 100.0% | ✅ NO |
| `os` | text | "iPadOS 17.5, upgradable to iPadOS 18" | "iPadOS 17.5, upgradable to iPadOS 18" | 100.0% | ✅ NO |
| `water_resistance` | text | "No official IP rating" | "No official IP rating" | 100.0% | ✅ NO |
| `battery_mah` | numeric | "10290" | "10290" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "8" | "8" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "13" | "13" | 100.0% | ✅ NO |
| `storage_gb` | numeric | "256" | "256" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "579" | "579" | 100.0% | ✅ NO |

### Samsung Galaxy S24 (93.8% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Glass front (Gorilla Glass Victus 2), glass back, aluminum frame" | "Glass front (Gorilla Glass Victus 2), glass back, aluminum frame" | 100.0% | ✅ NO |
| `camera_main` | text | "50 MP, f/1.8, 24mm (wide), Dual Pixel PDAF, OIS + 10 MP + 12 MP" | "50 MP, f/1.8, 24mm (wide), Dual Pixel PDAF, OIS + 10 MP + 12 MP" | 100.0% | ✅ NO |
| `chipset` | text | "Qualcomm Snapdragon 8 Gen 3 (4 nm) / Exynos 2400 (4 nm)" | "Qualcomm Snapdragon 8 Gen 3 (4 nm) / Exynos 2400 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits, 6.2 inches" | "Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits, 6.2 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14, One UI 6.1" | "Android 14, One UI 6.1" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP68 dust/water resistant (up to 1.5m for 30 min)" | "IP68 dust/water resistant (up to 1.5m for 30 min)" | 100.0% | ✅ NO |
| `battery_mah` | numeric | "4000" | "4000" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "8" | "8" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "2" | "6.2" | 32.3% | ⚠️ YES |
| `storage_gb` | numeric | "128" | "128" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "167" | "167" | 100.0% | ✅ NO |

### Google Pixel 8 Pro (76.2% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Gorilla Glass Victus 2 front & back, aluminum frame" | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass Victus 2), aluminum frame" | 48.3% | ⚠️ YES |
| `camera_main` | text | "50 MP (wide, OIS) + 48 MP (5x telephoto) + 48 MP (ultrawide)" | "50 MP, f/1.7, 25mm (wide), multi-directional PDAF, Laser AF, OIS + 48 MP + 48 MP" | 28.7% | ⚠️ YES |
| `chipset` | text | "Google Tensor G3 (4 nm)" | "Google Tensor G3 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "LTPO OLED, 120Hz, HDR10+, 2400 nits, 6.7 inches" | "LTPO OLED, 120Hz, HDR10+, 2400 nits, 6.7 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14, upgradable to Android 15 (7 years OS updates)" | "Android 14, upgradable to Android 15" | 63.2% | ⚠️ YES |
| `water_resistance` | text | "IP68 dust/water resistant (up to 1.5m for 30 mins)" | "IP68 dust/water resistant (up to 1.5m for 30 min)" | 98.0% | ✅ NO |
| `battery_mah` | numeric | "5050" | "5050" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "12" | "12" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "120" | "6.7" | 0.0% | ⚠️ YES |
| `storage_gb` | numeric | "128" | "128" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "213" | "213" | 100.0% | ✅ NO |

### OnePlus 12 (83.7% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Gorilla Glass Victus 2 front, Gorilla Glass back, aluminum frame" | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass), aluminum frame" | 61.3% | ⚠️ YES |
| `camera_main` | text | "50 MP (wide, OIS) + 64 MP (3x periscope telephoto) + 48 MP (ultrawide)" | "50 MP, f/1.6, 23mm (wide), multi-directional PDAF, OIS + 64 MP (periscope) + 48 MP (ultrawide)" | 44.7% | ⚠️ YES |
| `chipset` | text | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+, 4500 nits, 6.82 inches" | "LTPO AMOLED, 1B colors, 120Hz, Dolby Vision, HDR10+, 4500 nits, 6.82 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14, OxygenOS 14" | "Android 14, OxygenOS 14" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP65 waterproof and dust resistant" | "IP65 waterproof and dust resistant" | 100.0% | ✅ NO |
| `battery_mah` | numeric | "5400" | "5400" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "12" | "12" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "1" | "6.82" | 14.7% | ⚠️ YES |
| `storage_gb` | numeric | "256" | "256" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "220" | "220" | 100.0% | ✅ NO |

### Xiaomi 14 Ultra (73.3% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `,` | text | "Shield Glass front, eco-leather or ceramic back, aluminum/titanium frame" | "Glass or eco-leather back, aluminum alloy or titanium frame" | 54.2% | ⚠️ YES |
| `camera_main` | text | "50 MP (1.0\" | "50 MP, f/1.63-f/4.0, 23mm (wide), 1.0\" | 28.9% | ⚠️ YES |
| `chipset` | text | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "LTPO AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 3000 nits, 6.73 inches" | "LTPO AMOLED, 68B colors, 120Hz, Dolby Vision, HDR10+, 3000 nits, 6.73 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14, HyperOS" | "Android 14, HyperOS" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP68 dust/water resistant (up to 1.5m for 30 mins)" | "IP68 dust/water resistant (up to 1.5m for 30 min)" | 98.0% | ✅ NO |
| `battery_mah` | numeric | "5000" | "5000" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "12" | "16" | 75.0% | ⚠️ YES |
| `screen_size_inches` | numeric | "68" | "6.73" | 0.0% | ⚠️ YES |
| `storage_gb` | numeric | "256" | "512" | 50.0% | ⚠️ YES |
| `weight_grams` | numeric | "224" | "224" | 100.0% | ✅ NO |

### Asus ROG Phone 8 Pro (92.3% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass), aluminum frame" | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass), aluminum frame" | 100.0% | ✅ NO |
| `camera_main` | text | "50 MP, f/1.9, 24mm (wide), gimbal OIS + 32 MP + 13 MP" | "50 MP, f/1.9, 24mm (wide), gimbal OIS + 32 MP + 13 MP" | 100.0% | ✅ NO |
| `chipset` | text | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "LTPO AMOLED, 1B colors, 165Hz, HDR10, 2500 nits, 6.78 inches" | "LTPO AMOLED, 1B colors, 165Hz, HDR10, 2500 nits, 6.78 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14" | "Android 14" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP68 dust/water resistant (up to 1.5m for 30 min)" | "IP68 dust/water resistant (up to 1.5m for 30 min)" | 100.0% | ✅ NO |
| `battery_mah` | numeric | "5500" | "5500" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "16" | "16" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "1" | "6.78" | 14.8% | ⚠️ YES |
| `storage_gb` | numeric | "512" | "512" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "225" | "225" | 100.0% | ✅ NO |

### Sony Xperia 1 VI (92.3% Match)
| Spec Field | Type | Local Dataset Value | Ground-Truth Internet Value | Similarity Score | Flagged |
|---|---|---|---|---|---|
| `build_material` | text | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass Victus), aluminum frame" | "Glass front (Gorilla Glass Victus 2), glass back (Gorilla Glass Victus), aluminum frame" | 100.0% | ✅ NO |
| `camera_main` | text | "48 MP, f/1.9, 24mm (wide), Dual Pixel PDAF, OIS + 12 MP (periscope telephoto) + 12 MP" | "48 MP, f/1.9, 24mm (wide), Dual Pixel PDAF, OIS + 12 MP (periscope telephoto) + 12 MP" | 100.0% | ✅ NO |
| `chipset` | text | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | "Qualcomm Snapdragon 8 Gen 3 (4 nm)" | 100.0% | ✅ NO |
| `display` | text | "LTPO OLED, 1B colors, 120Hz, HDR BT.2020, 6.5 inches" | "LTPO OLED, 1B colors, 120Hz, HDR BT.2020, 6.5 inches" | 100.0% | ✅ NO |
| `os` | text | "Android 14" | "Android 14" | 100.0% | ✅ NO |
| `water_resistance` | text | "IP65/IP68 dust/water resistant (up to 1.5m for 30 min)" | "IP65/IP68 dust/water resistant (up to 1.5m for 30 min)" | 100.0% | ✅ NO |
| `battery_mah` | numeric | "5000" | "5000" | 100.0% | ✅ NO |
| `ram_gb` | numeric | "12" | "12" | 100.0% | ✅ NO |
| `screen_size_inches` | numeric | "1" | "6.5" | 15.4% | ⚠️ YES |
| `storage_gb` | numeric | "256" | "256" | 100.0% | ✅ NO |
| `weight_grams` | numeric | "192" | "192" | 100.0% | ✅ NO |

