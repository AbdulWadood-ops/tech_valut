#ifndef RANKING_ENGINE_HPP
#define RANKING_ENGINE_HPP

#include <cmath>
#include <vector>
#include <string>
#include <algorithm>
#include <iostream>

struct DeviceMetrics {
    std::string deviceId;
    std::string name;
    std::string brand;
    std::string category;
    double searchCount;
    double requestCount;
    double lastAccessedHoursAgo;
    double basePrice;
    std::string status;
};

struct RankedDevice {
    std::string deviceId;
    std::string name;
    std::string brand;
    std::string category;
    double searchScore;
    double requestScore;
    double recencyScore;
    double score;
    double searchCount;
    double requestCount;
    double lastAccessedHoursAgo;
};

// Configurable weights and exponential decay parameter
constexpr double W_SEARCH  = 0.40;
constexpr double W_REQUEST = 0.40;
constexpr double W_RECENCY = 0.20;
constexpr double DECAY_LAMBDA = 0.05; // higher = older data cools off faster

inline double normalize(double value, double minVal, double maxVal) {
    if (maxVal - minVal < 1e-9) return 0.0;
    return (value - minVal) / (maxVal - minVal);
}

inline std::vector<RankedDevice> computeRankings(const std::vector<DeviceMetrics>& devices,
                                                double w_search = W_SEARCH,
                                                double w_request = W_REQUEST,
                                                double w_recency = W_RECENCY,
                                                double decay_lambda = DECAY_LAMBDA) {
    if (devices.empty()) return {};

    double maxSearch = 0.0;
    double maxRequest = 0.0;
    for (const auto& d : devices) {
        if (d.searchCount > maxSearch) maxSearch = d.searchCount;
        if (d.requestCount > maxRequest) maxRequest = d.requestCount;
    }

    std::vector<RankedDevice> results;
    results.reserve(devices.size());

    for (const auto& d : devices) {
        double searchScore  = normalize(d.searchCount, 0.0, maxSearch);
        double requestScore = normalize(d.requestCount, 0.0, maxRequest);
        double recencyScore = std::exp(-decay_lambda * std::max(0.0, d.lastAccessedHoursAgo));

        double finalScore = (w_search * searchScore)
                          + (w_request * requestScore)
                          + (w_recency * recencyScore);

        results.push_back({
            d.deviceId,
            d.name,
            d.brand,
            d.category,
            searchScore,
            requestScore,
            recencyScore,
            finalScore,
            d.searchCount,
            d.requestCount,
            d.lastAccessedHoursAgo
        });
    }

    std::sort(results.begin(), results.end(),
        [](const RankedDevice& a, const RankedDevice& b) {
            return a.score > b.score;
        });

    return results;
}

#endif // RANKING_ENGINE_HPP
