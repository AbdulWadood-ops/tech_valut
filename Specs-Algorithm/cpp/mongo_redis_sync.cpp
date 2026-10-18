/**
 * C++ MongoDB Read + Redis Write Engine
 * Direct C++ worker for maximum throughput and minimal overhead
 */

#include <iostream>
#include <vector>
#include <string>
#include <chrono>
#include "ranking_engine.hpp"

// Note: In production with full libmongocxx and redis++ installed:
// #include <mongocxx/client.hpp>
// #include <mongocxx/instance.hpp>
// #include <sw/redis++/redis++.h>

int main(int argc, char* argv[]) {
    std::cout << "[C++ Worker] Starting Device Ranking & Redis Sync Engine...\n";
    
    // Configurable parameters
    double w_search = 0.40;
    double w_request = 0.40;
    double w_recency = 0.20;
    double decay_lambda = 0.05;

    // Simulation / Direct batch processing
    std::vector<DeviceMetrics> sampleBatch;
    sampleBatch.reserve(20000);

    for (int i = 0; i < 20000; ++i) {
        DeviceMetrics d;
        d.deviceId = "DEV-" + std::to_string(i + 1);
        d.name = "Device " + std::to_string(i + 1);
        d.brand = (i % 2 == 0) ? "Apple" : "Samsung";
        d.category = "Smartphone";
        d.searchCount = (i * 137 % 8000) + 10;
        d.requestCount = (i * 251 % 5000) + 5;
        d.lastAccessedHoursAgo = (i * 19 % 120) * 0.5;
        sampleBatch.push_back(d);
    }

    auto start = std::chrono::high_resolution_clock::now();
    auto ranked = computeRankings(sampleBatch, w_search, w_request, w_recency, decay_lambda);
    auto end = std::chrono::high_resolution_clock::now();

    double elapsed = std::chrono::duration<double, std::milli>(end - start).count();

    std::cout << "[C++ Worker] Successfully ranked " << ranked.size() 
              << " devices in " << elapsed << " ms (" 
              << (ranked.size() / (elapsed / 1000.0)) << " devices/sec throughput)\n";
    
    std::cout << "[C++ Worker] Top 3 Ranked Devices:\n";
    for (size_t i = 0; i < std::min<size_t>(3, ranked.size()); ++i) {
        std::cout << "  #" << (i + 1) << " " << ranked[i].deviceId 
                  << " | Score: " << ranked[i].score 
                  << " (Search: " << ranked[i].searchCount 
                  << ", Req: " << ranked[i].requestCount 
                  << ", HoursAgo: " << ranked[i].lastAccessedHoursAgo << ")\n";
    }

    return 0;
}
