#ifndef VERIFICATION_ENGINE_HPP
#define VERIFICATION_ENGINE_HPP

#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <cmath>
#include <cctype>
#include <sstream>

// Levenshtein distance — optimized 2-row DP for memory efficiency O(min(N, M))
inline int levenshteinDistance(const std::string& s1, const std::string& s2) {
    const size_t len1 = s1.size();
    const size_t len2 = s2.size();
    if (len1 == 0) return static_cast<int>(len2);
    if (len2 == 0) return static_cast<int>(len1);

    std::vector<int> col(len2 + 1);
    std::vector<int> prevCol(len2 + 1);

    for (size_t i = 0; i <= len2; ++i) {
        prevCol[i] = static_cast<int>(i);
    }

    for (size_t i = 0; i < len1; ++i) {
        col[0] = static_cast<int>(i + 1);
        for (size_t j = 0; j < len2; ++j) {
            int cost = (std::tolower(static_cast<unsigned char>(s1[i])) == 
                        std::tolower(static_cast<unsigned char>(s2[j]))) ? 0 : 1;
            col[j + 1] = std::min({
                prevCol[j + 1] + 1, // deletion
                col[j] + 1,         // insertion
                prevCol[j] + cost   // substitution
            });
        }
        prevCol = col;
    }

    return col[len2];
}

// Text similarity [0.0 - 1.0] based on normalized edit distance
inline double textSimilarity(const std::string& claimed, const std::string& reference) {
    if (claimed == reference) return 1.0;
    int maxLen = static_cast<int>(std::max(claimed.size(), reference.size()));
    if (maxLen == 0) return 1.0;
    int distance = levenshteinDistance(claimed, reference);
    double score = 1.0 - (static_cast<double>(distance) / maxLen);
    return std::max(0.0, std::min(1.0, score));
}

// Numeric similarity [0.0 - 1.0] with relative tolerance
inline double numericSimilarity(double claimed, double reference) {
    if (claimed == reference) return 1.0;
    if (reference == 0.0) {
        return claimed == 0.0 ? 1.0 : 0.0;
    }
    double diff = std::abs(claimed - reference) / std::abs(reference);
    return std::max(0.0, 1.0 - diff);
}

struct FieldResult {
    std::string fieldName;
    std::string type; // "text" or "numeric"
    std::string claimedValue;
    std::string referenceValue;
    double similarityScore;
    bool flagged;
    std::string mismatchReason;
};

struct VerificationReport {
    std::string deviceId;
    std::string deviceName;
    std::vector<FieldResult> fields;
    double overallConfidence;
    int totalChecked;
    int flaggedCount;
    bool verified;
};

inline VerificationReport verifyDeviceSpecs(
    const std::string& deviceId,
    const std::string& deviceName,
    const std::map<std::string, std::string>& claimedTextFields,
    const std::map<std::string, std::string>& referenceTextFields,
    const std::map<std::string, double>& claimedNumericFields,
    const std::map<std::string, double>& referenceNumericFields,
    double threshold = 0.85
) {
    VerificationReport report;
    report.deviceId = deviceId;
    report.deviceName = deviceName;
    report.totalChecked = 0;
    report.flaggedCount = 0;
    double totalScore = 0.0;

    // Check text fields
    for (const auto& kv : claimedTextFields) {
        const std::string& field = kv.first;
        const std::string& claimedVal = kv.second;

        auto refIt = referenceTextFields.find(field);
        if (refIt != referenceTextFields.end()) {
            const std::string& refVal = refIt->second;
            double score = textSimilarity(claimedVal, refVal);
            bool isFlagged = score < threshold;
            
            std::string reason = "Match within threshold";
            if (isFlagged) {
                if (score < 0.3) {
                    reason = "Critical mismatch in spec value";
                } else if (score < 0.6) {
                    reason = "Significant discrepancy detected";
                } else {
                    reason = "Minor wording/formatting variance";
                }
            }

            report.fields.push_back({
                field,
                "text",
                claimedVal,
                refVal,
                score,
                isFlagged,
                reason
            });

            totalScore += score;
            report.totalChecked++;
            if (isFlagged) report.flaggedCount++;
        }
    }

    // Check numeric fields
    for (const auto& kv : claimedNumericFields) {
        const std::string& field = kv.first;
        double claimedVal = kv.second;

        auto refIt = referenceNumericFields.find(field);
        if (refIt != referenceNumericFields.end()) {
            double refVal = refIt->second;
            double score = numericSimilarity(claimedVal, refVal);
            bool isFlagged = score < threshold;

            std::stringstream ssClaimed, ssRef;
            ssClaimed << claimedVal;
            ssRef << refVal;

            std::string reason = "Numerical match within tolerance";
            if (isFlagged) {
                double diffPct = (std::abs(claimedVal - refVal) / (refVal != 0 ? std::abs(refVal) : 1.0)) * 100.0;
                std::stringstream ssReason;
                ssReason << "Discrepancy of " << static_cast<int>(diffPct) << "% (" << claimedVal << " vs " << refVal << ")";
                reason = ssReason.str();
            }

            report.fields.push_back({
                field,
                "numeric",
                ssClaimed.str(),
                ssRef.str(),
                score,
                isFlagged,
                reason
            });

            totalScore += score;
            report.totalChecked++;
            if (isFlagged) report.flaggedCount++;
        }
    }

    report.overallConfidence = (report.totalChecked > 0) ? (totalScore / report.totalChecked) : 0.0;
    report.verified = (report.overallConfidence >= threshold && report.flaggedCount == 0);

    return report;
}

#endif // VERIFICATION_ENGINE_HPP
