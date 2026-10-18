#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <chrono>
#include <iomanip>
#include "verification_engine.hpp"

// Simple parser for verification payload JSON
static std::string trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\n\r\"");
    if (first == std::string::npos) return "";
    size_t last = str.find_last_not_of(" \t\n\r\"");
    return str.substr(first, (last - first + 1));
}

static std::string escapeJson(const std::string& str) {
    std::string out;
    for (char c : str) {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

int main(int argc, char* argv[]) {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    bool benchmarkMode = false;
    int benchmarkCount = 5000;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--benchmark") {
            benchmarkMode = true;
        } else if (arg.rfind("--count=", 0) == 0) {
            benchmarkCount = std::stoi(arg.substr(8));
        }
    }

    if (benchmarkMode) {
        std::map<std::string, std::string> claimedText = {
            {"display", "6.7 inch Super Retina XDR OLED 120Hz"},
            {"processor", "Apple A17 Pro (3nm)"},
            {"os", "iOS 17.4"},
            {"water_resistance", "IP68 dust/water resistant up to 6m for 30 min"},
            {"camera_main", "48 MP f/1.78 quad-pixel sensor"}
        };
        std::map<std::string, std::string> refText = {
            {"display", "6.7\" Super Retina XDR OLED 120Hz ProMotion"},
            {"processor", "A17 Pro Hexa-core"},
            {"os", "iOS 17"},
            {"water_resistance", "IP68 rating (6m 30 mins)"},
            {"camera_main", "48 MP f/1.8 sensor"}
        };
        std::map<std::string, double> claimedNum = {
            {"ram_gb", 8.0},
            {"storage_gb", 256.0},
            {"battery_mah", 4422.0},
            {"weight_grams", 221.0}
        };
        std::map<std::string, double> refNum = {
            {"ram_gb", 8.0},
            {"storage_gb", 256.0},
            {"battery_mah", 4441.0},
            {"weight_grams", 221.0}
        };

        auto startTime = std::chrono::high_resolution_clock::now();
        std::vector<VerificationReport> reports;
        reports.reserve(benchmarkCount);
        for (int i = 0; i < benchmarkCount; ++i) {
            reports.push_back(verifyDeviceSpecs("DEV-" + std::to_string(i), "iPhone 15 Pro Max", claimedText, refText, claimedNum, refNum));
        }
        auto endTime = std::chrono::high_resolution_clock::now();
        double elapsedMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

        std::cout << "{\n";
        std::cout << "  \"engine\": \"C++ Spec Verification Engine v2.0\",\n";
        std::cout << "  \"benchmarkCount\": " << benchmarkCount << ",\n";
        std::cout << "  \"totalFieldsEvaluated\": " << (benchmarkCount * 9) << ",\n";
        std::cout << "  \"executionTimeMs\": " << std::fixed << std::setprecision(4) << elapsedMs << ",\n";
        std::cout << "  \"averagePerDeviceMs\": " << (elapsedMs / benchmarkCount) << ",\n";
        std::cout << "  \"sampleReport\": {\n";
        std::cout << "    \"deviceId\": \"" << reports[0].deviceId << "\",\n";
        std::cout << "    \"overallConfidence\": " << std::fixed << std::setprecision(4) << reports[0].overallConfidence << ",\n";
        std::cout << "    \"flaggedCount\": " << reports[0].flaggedCount << ",\n";
        std::cout << "    \"verified\": " << (reports[0].verified ? "true" : "false") << "\n";
        std::cout << "  }\n";
        std::cout << "}\n";
        return 0;
    }

    // Read payload from stdin
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line + "\n";
    }

    if (input.empty()) {
        std::cerr << "{\"error\": \"Empty input provided\"}\n";
        return 1;
    }

    // Interactive/production JSON parsing for spec comparison
    // Format expected:
    // { "deviceId": "...", "deviceName": "...", "claimed": { "text": {...}, "numeric": {...} }, "reference": { "text": {...}, "numeric": {...} }, "threshold": 0.85 }
    
    std::string deviceId = "DEV-INPUT";
    std::string deviceName = "Unknown Device";
    double threshold = 0.85;

    std::map<std::string, std::string> claimedText;
    std::map<std::string, std::string> refText;
    std::map<std::string, double> claimedNum;
    std::map<std::string, double> refNum;

    // Helper lambda to parse key-values from sections
    auto parseMapSection = [&](const std::string& section, std::map<std::string, std::string>& targetMap) {
        size_t pos = 0;
        while (pos < section.size()) {
            size_t kStart = section.find('"', pos);
            if (kStart == std::string::npos) break;
            size_t kEnd = section.find('"', kStart + 1);
            if (kEnd == std::string::npos) break;
            std::string key = section.substr(kStart + 1, kEnd - kStart - 1);

            size_t colon = section.find(':', kEnd);
            if (colon == std::string::npos) break;

            size_t vStart = section.find('"', colon);
            if (vStart == std::string::npos) break;
            size_t vEnd = section.find('"', vStart + 1);
            if (vEnd == std::string::npos) break;
            std::string val = section.substr(vStart + 1, vEnd - vStart - 1);

            targetMap[key] = val;
            pos = vEnd + 1;
        }
    };

    auto parseNumMapSection = [&](const std::string& section, std::map<std::string, double>& targetMap) {
        size_t pos = 0;
        while (pos < section.size()) {
            size_t kStart = section.find('"', pos);
            if (kStart == std::string::npos) break;
            size_t kEnd = section.find('"', kStart + 1);
            if (kEnd == std::string::npos) break;
            std::string key = section.substr(kStart + 1, kEnd - kStart - 1);

            size_t colon = section.find(':', kEnd);
            if (colon == std::string::npos) break;

            size_t numStart = colon + 1;
            while (numStart < section.size() && (section[numStart] == ' ' || section[numStart] == '\t' || section[numStart] == '\n' || section[numStart] == '\r')) {
                numStart++;
            }
            size_t numEnd = numStart;
            while (numEnd < section.size() && (section[numEnd] == '.' || (section[numEnd] >= '0' && section[numEnd] <= '9') || section[numEnd] == '-')) {
                numEnd++;
            }
            std::string numStr = section.substr(numStart, numEnd - numStart);
            if (!numStr.empty()) {
                try {
                    targetMap[key] = std::stod(numStr);
                } catch (...) {}
            }
            pos = numEnd + 1;
        }
    };

    // Extract deviceId and deviceName
    size_t dIdPos = input.find("\"deviceId\"");
    if (dIdPos != std::string::npos) {
        size_t valStart = input.find('"', input.find(':', dIdPos));
        if (valStart != std::string::npos) {
            size_t valEnd = input.find('"', valStart + 1);
            if (valEnd != std::string::npos) deviceId = input.substr(valStart + 1, valEnd - valStart - 1);
        }
    }

    size_t dNamePos = input.find("\"deviceName\"");
    if (dNamePos != std::string::npos) {
        size_t valStart = input.find('"', input.find(':', dNamePos));
        if (valStart != std::string::npos) {
            size_t valEnd = input.find('"', valStart + 1);
            if (valEnd != std::string::npos) deviceName = input.substr(valStart + 1, valEnd - valStart - 1);
        }
    }

    // Extract claimed text / num
    size_t claimedPos = input.find("\"claimed\"");
    size_t refPos = input.find("\"reference\"");

    if (claimedPos != std::string::npos && refPos != std::string::npos) {
        std::string claimedBlock = input.substr(claimedPos, refPos - claimedPos);
        std::string refBlock = input.substr(refPos);

        size_t cTextPos = claimedBlock.find("\"text\"");
        size_t cNumPos = claimedBlock.find("\"numeric\"");
        if (cTextPos != std::string::npos) {
            size_t bStart = claimedBlock.find('{', cTextPos);
            size_t bEnd = claimedBlock.find('}', bStart);
            if (bStart != std::string::npos && bEnd != std::string::npos) {
                parseMapSection(claimedBlock.substr(bStart, bEnd - bStart + 1), claimedText);
            }
        }
        if (cNumPos != std::string::npos) {
            size_t bStart = claimedBlock.find('{', cNumPos);
            size_t bEnd = claimedBlock.find('}', bStart);
            if (bStart != std::string::npos && bEnd != std::string::npos) {
                parseNumMapSection(claimedBlock.substr(bStart, bEnd - bStart + 1), claimedNum);
            }
        }

        size_t rTextPos = refBlock.find("\"text\"");
        size_t rNumPos = refBlock.find("\"numeric\"");
        if (rTextPos != std::string::npos) {
            size_t bStart = refBlock.find('{', rTextPos);
            size_t bEnd = refBlock.find('}', bStart);
            if (bStart != std::string::npos && bEnd != std::string::npos) {
                parseMapSection(refBlock.substr(bStart, bEnd - bStart + 1), refText);
            }
        }
        if (rNumPos != std::string::npos) {
            size_t bStart = refBlock.find('{', rNumPos);
            size_t bEnd = refBlock.find('}', bStart);
            if (bStart != std::string::npos && bEnd != std::string::npos) {
                parseNumMapSection(refBlock.substr(bStart, bEnd - bStart + 1), refNum);
            }
        }
    }

    auto startTime = std::chrono::high_resolution_clock::now();
    VerificationReport report = verifyDeviceSpecs(deviceId, deviceName, claimedText, refText, claimedNum, refNum, threshold);
    auto endTime = std::chrono::high_resolution_clock::now();
    double elapsedMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    std::cout << "{\n";
    std::cout << "  \"engine\": \"C++ Spec Verification Engine v2.0\",\n";
    std::cout << "  \"executionTimeMs\": " << std::fixed << std::setprecision(4) << elapsedMs << ",\n";
    std::cout << "  \"deviceId\": \"" << escapeJson(report.deviceId) << "\",\n";
    std::cout << "  \"deviceName\": \"" << escapeJson(report.deviceName) << "\",\n";
    std::cout << "  \"overallConfidence\": " << std::fixed << std::setprecision(4) << report.overallConfidence << ",\n";
    std::cout << "  \"totalChecked\": " << report.totalChecked << ",\n";
    std::cout << "  \"flaggedCount\": " << report.flaggedCount << ",\n";
    std::cout << "  \"verified\": " << (report.verified ? "true" : "false") << ",\n";
    std::cout << "  \"fields\": [\n";
    for (size_t i = 0; i < report.fields.size(); ++i) {
        const auto& f = report.fields[i];
        std::cout << "    {\n";
        std::cout << "      \"fieldName\": \"" << escapeJson(f.fieldName) << "\",\n";
        std::cout << "      \"type\": \"" << escapeJson(f.type) << "\",\n";
        std::cout << "      \"claimedValue\": \"" << escapeJson(f.claimedValue) << "\",\n";
        std::cout << "      \"referenceValue\": \"" << escapeJson(f.referenceValue) << "\",\n";
        std::cout << "      \"similarityScore\": " << std::fixed << std::setprecision(4) << f.similarityScore << ",\n";
        std::cout << "      \"flagged\": " << (f.flagged ? "true" : "false") << ",\n";
        std::cout << "      \"mismatchReason\": \"" << escapeJson(f.mismatchReason) << "\"\n";
        std::cout << "    }" << (i + 1 < report.fields.size() ? "," : "") << "\n";
    }
    std::cout << "  ]\n";
    std::cout << "}\n";

    return 0;
}
