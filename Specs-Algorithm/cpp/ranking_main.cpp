#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <chrono>
#include <iomanip>
#include "ranking_engine.hpp"

// Lightweight JSON helper to avoid heavyweight external C++ library dependencies
// for portability across any Windows/Linux g++ toolchain
static std::string extractJsonString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":\"";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos += search.length();
    size_t endPos = json.find("\"", pos);
    if (endPos == std::string::npos) return "";
    return json.substr(pos, endPos - pos);
}

static double extractJsonNumber(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":";
    size_t pos = json.find(search);
    if (pos == std::string::npos) return 0.0;
    pos += search.length();
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) pos++;
    size_t endPos = pos;
    while (endPos < json.size() && (json[endPos] == '.' || (json[endPos] >= '0' && json[endPos] <= '9') || json[endPos] == '-')) {
        endPos++;
    }
    std::string valStr = json.substr(pos, endPos - pos);
    if (valStr.empty()) return 0.0;
    try {
        return std::stod(valStr);
    } catch (...) {
        return 0.0;
    }
}

int main(int argc, char* argv[]) {
    // Fast I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    bool benchmarkMode = false;
    int benchmarkCount = 20000;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--benchmark") {
            benchmarkMode = true;
        } else if (arg.rfind("--count=", 0) == 0) {
            benchmarkCount = std::stoi(arg.substr(8));
        }
    }

    std::vector<DeviceMetrics> devices;

    if (benchmarkMode) {
        // Generate simulated devices for performance verification
        devices.reserve(benchmarkCount);
        for (int i = 0; i < benchmarkCount; ++i) {
            DeviceMetrics d;
            d.deviceId = "DEV-" + std::to_string(i + 1);
            d.name = "Device " + std::to_string(i + 1);
            d.brand = (i % 3 == 0) ? "Apple" : (i % 3 == 1 ? "Samsung" : "Google");
            d.category = (i % 2 == 0) ? "Smartphone" : "Tablet";
            d.searchCount = (i * 137 % 5000) + 10;
            d.requestCount = (i * 251 % 3000) + 5;
            d.lastAccessedHoursAgo = (i * 17 % 240) * 0.5;
            d.basePrice = 299.0 + (i % 1000);
            d.status = (i % 10 == 0) ? "maintenance" : "active";
            devices.push_back(d);
        }
    } else {
        // Read JSON objects / lines from stdin
        std::string fullInput;
        std::string line;
        while (std::getline(std::cin, line)) {
            fullInput += line;
        }

        if (fullInput.empty()) {
            std::cerr << "{\"error\":\"No input provided\"}\n";
            return 1;
        }

        // Parse list of objects
        size_t cursor = 0;
        while (true) {
            size_t objStart = fullInput.find('{', cursor);
            if (objStart == std::string::npos) break;
            size_t objEnd = fullInput.find('}', objStart);
            if (objEnd == std::string::npos) break;

            std::string objStr = fullInput.substr(objStart, objEnd - objStart + 1);
            DeviceMetrics d;
            d.deviceId = extractJsonString(objStr, "deviceId");
            if (d.deviceId.empty()) {
                d.deviceId = extractJsonString(objStr, "id");
            }
            d.name = extractJsonString(objStr, "name");
            d.brand = extractJsonString(objStr, "brand");
            d.category = extractJsonString(objStr, "category");
            d.status = extractJsonString(objStr, "status");
            d.searchCount = extractJsonNumber(objStr, "searchCount");
            d.requestCount = extractJsonNumber(objStr, "requestCount");
            d.lastAccessedHoursAgo = extractJsonNumber(objStr, "lastAccessedHoursAgo");
            d.basePrice = extractJsonNumber(objStr, "basePrice");

            if (!d.deviceId.empty()) {
                devices.push_back(d);
            }
            cursor = objEnd + 1;
        }
    }

    auto startTime = std::chrono::high_resolution_clock::now();
    auto ranked = computeRankings(devices);
    auto endTime = std::chrono::high_resolution_clock::now();
    double elapsedMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    // Output JSON response
    std::cout << "{\n";
    std::cout << "  \"engine\": \"C++ Ranking Engine v2.0\",\n";
    std::cout << "  \"processedCount\": " << ranked.size() << ",\n";
    std::cout << "  \"executionTimeMs\": " << std::fixed << std::setprecision(4) << elapsedMs << ",\n";
    std::cout << "  \"results\": [\n";
    for (size_t i = 0; i < ranked.size(); ++i) {
        const auto& r = ranked[i];
        std::cout << "    {\n";
        std::cout << "      \"rank\": " << (i + 1) << ",\n";
        std::cout << "      \"deviceId\": \"" << r.deviceId << "\",\n";
        std::cout << "      \"name\": \"" << r.name << "\",\n";
        std::cout << "      \"brand\": \"" << r.brand << "\",\n";
        std::cout << "      \"category\": \"" << r.category << "\",\n";
        std::cout << "      \"score\": " << std::fixed << std::setprecision(6) << r.score << ",\n";
        std::cout << "      \"searchScore\": " << std::fixed << std::setprecision(6) << r.searchScore << ",\n";
        std::cout << "      \"requestScore\": " << std::fixed << std::setprecision(6) << r.requestScore << ",\n";
        std::cout << "      \"recencyScore\": " << std::fixed << std::setprecision(6) << r.recencyScore << ",\n";
        std::cout << "      \"searchCount\": " << r.searchCount << ",\n";
        std::cout << "      \"requestCount\": " << r.requestCount << ",\n";
        std::cout << "      \"lastAccessedHoursAgo\": " << r.lastAccessedHoursAgo << "\n";
        std::cout << "    }" << (i + 1 < ranked.size() ? "," : "") << "\n";
    }
    std::cout << "  ]\n";
    std::cout << "}\n";

    return 0;
}
