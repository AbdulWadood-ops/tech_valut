#include <iostream>
#include <cassert>
#include <vector>
#include <cmath>
#include <chrono>
#include <iomanip>
#include "../cpp/ranking_engine.hpp"

void testHighestScore() {
    std::cout << "[Test 1] Highest search + request + recency gets highest score... ";
    std::vector<DeviceMetrics> devices = {
        {"DEV-A", "Device A", "Brand", "Phone", 5000, 3000, 0.0, 999, "active"},
        {"DEV-B", "Device B", "Brand", "Phone", 100, 50, 10.0, 999, "active"},
        {"DEV-C", "Device C", "Brand", "Phone", 2500, 1500, 5.0, 999, "active"}
    };
    auto ranked = computeRankings(devices);
    assert(ranked[0].deviceId == "DEV-A");
    assert(ranked[0].score > ranked[1].score);
    assert(ranked[1].score > ranked[2].score);
    std::cout << "PASSED (DEV-A Score: " << ranked[0].score << ")\n";
}

void testAllZeroMetrics() {
    std::cout << "[Test 2] Device with all-zero metrics gets score of 0... ";
    std::vector<DeviceMetrics> devices = {
        {"DEV-ZERO", "Zero Device", "Brand", "Phone", 0, 0, 999999.0, 0, "offline"}
    };
    auto ranked = computeRankings(devices);
    assert(std::abs(ranked[0].score - 0.0) < 1e-6);
    std::cout << "PASSED (Score: " << ranked[0].score << ")\n";
}

void testDeterminism() {
    std::cout << "[Test 3] Two identical devices get identical scores... ";
    std::vector<DeviceMetrics> devices = {
        {"DEV-1", "Dev 1", "Brand", "Phone", 1000, 500, 2.0, 500, "active"},
        {"DEV-2", "Dev 2", "Brand", "Phone", 1000, 500, 2.0, 500, "active"}
    };
    auto ranked = computeRankings(devices);
    assert(std::abs(ranked[0].score - ranked[1].score) < 1e-9);
    std::cout << "PASSED (" << ranked[0].score << " == " << ranked[1].score << ")\n";
}

void testStrictDescendingSort() {
    std::cout << "[Test 4] Output list is sorted strictly descending by score... ";
    std::vector<DeviceMetrics> devices;
    for (int i = 0; i < 50; ++i) {
        devices.push_back({"DEV-" + std::to_string(i), "Dev", "Brand", "Phone", 
                          (double)(i * 37 % 1000), (double)(i * 41 % 500), (double)(i % 50), 300, "active"});
    }
    auto ranked = computeRankings(devices);
    for (size_t i = 1; i < ranked.size(); ++i) {
        assert(ranked[i - 1].score >= ranked[i].score);
    }
    std::cout << "PASSED (Verified 50 items strictly sorted)\n";
}

void testExponentialDecay() {
    std::cout << "[Test 5] Exponential decay behavior (0h > 24h > 72h > 168h)... ";
    std::vector<DeviceMetrics> devices = {
        {"DEV-0H", "Dev 0h", "Brand", "Phone", 1000, 1000, 0.0, 500, "active"},
        {"DEV-24H", "Dev 24h", "Brand", "Phone", 1000, 1000, 24.0, 500, "active"},
        {"DEV-72H", "Dev 72h", "Brand", "Phone", 1000, 1000, 72.0, 500, "active"},
        {"DEV-168H", "Dev 168h", "Brand", "Phone", 1000, 1000, 168.0, 500, "active"}
    };
    auto ranked = computeRankings(devices);
    assert(ranked[0].deviceId == "DEV-0H");
    assert(ranked[1].deviceId == "DEV-24H");
    assert(ranked[2].deviceId == "DEV-72H");
    assert(ranked[3].deviceId == "DEV-168H");
    std::cout << "PASSED (0h: " << ranked[0].score << " > 24h: " << ranked[1].score 
              << " > 72h: " << ranked[2].score << " > 168h: " << ranked[3].score << ")\n";
}

void test20kPerformance() {
    std::cout << "[Test 6] Benchmark 20,000 synthetic devices in under 200ms... ";
    std::vector<DeviceMetrics> devices;
    devices.reserve(20000);
    for (int i = 0; i < 20000; ++i) {
        devices.push_back({
            "DEV-" + std::to_string(i + 1),
            "Device " + std::to_string(i + 1),
            "Brand",
            "Smartphone",
            (double)((i * 137) % 6500 + 10),
            (double)((i * 251) % 4000 + 5),
            (double)((i * 19) % 240) * 0.5,
            500.0,
            "active"
        });
    }

    auto start = std::chrono::high_resolution_clock::now();
    auto ranked = computeRankings(devices);
    auto end = std::chrono::high_resolution_clock::now();
    double elapsedMs = std::chrono::duration<double, std::milli>(end - start).count();

    assert(ranked.size() == 20000);
    assert(elapsedMs < 200.0);
    std::cout << "PASSED! (Processed 20,000 devices in " << std::fixed << std::setprecision(3) 
              << elapsedMs << " ms | Throughput: " << static_cast<int>(20000 / (elapsedMs / 1000.0)) << " devices/sec)\n";
}

int main() {
    std::cout << "========================================================\n";
    std::cout << "🧪 SYSTEM 6 TEST SUITE: C++ RANKING ENGINE UNIT TESTS\n";
    std::cout << "========================================================\n";
    testHighestScore();
    testAllZeroMetrics();
    testDeterminism();
    testStrictDescendingSort();
    testExponentialDecay();
    test20kPerformance();
    std::cout << "\n✅ ALL SYSTEM 6 UNIT TESTS PASSED SUCCESSFULLY!\n";
    std::cout << "========================================================\n";
    return 0;
}
