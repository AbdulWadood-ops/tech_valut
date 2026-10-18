#include <iostream>
#include <cassert>
#include <vector>
#include <cmath>
#include <iomanip>
#include "../cpp/verification_engine.hpp"

void testStringComparisons() {
    std::cout << "[Test 1-3] String similarity assertions... ";
    
    // 1. Identical strings
    double exact = textSimilarity("iPhone 15 Pro", "iPhone 15 Pro");
    assert(std::abs(exact - 1.0) < 1e-6);

    // 2. Completely different strings
    double diff = textSimilarity("iPhone 15 Pro", "XYZ 99999");
    assert(diff < 0.4);

    // 3. One character typo
    double typo = textSimilarity("iPhone 15 Pro", "iPhone 15 Pr0");
    assert(typo > 0.85 && typo < 1.0);

    std::cout << "PASSED (Exact: " << exact << ", Diff: " << diff << ", Typo: " << typo << ")\n";
}

void testNumericComparisons() {
    std::cout << "[Test 4] Numeric similarity assertions... ";

    // 16 vs 16 = 1.0
    double exactNum = numericSimilarity(16.0, 16.0);
    assert(std::abs(exactNum - 1.0) < 1e-6);

    // 8 vs 16 = 0.5 (diff = 8/16 = 0.5 => 1 - 0.5 = 0.5)
    double halfNum = numericSimilarity(8.0, 16.0);
    assert(std::abs(halfNum - 0.5) < 1e-6);

    // 0 vs 0 = 1.0 (avoid divide by zero)
    double zeroZero = numericSimilarity(0.0, 0.0);
    assert(std::abs(zeroZero - 1.0) < 1e-6);

    // 5 vs 0 = 0.0
    double fiveZero = numericSimilarity(5.0, 0.0);
    assert(std::abs(fiveZero - 0.0) < 1e-6);

    std::cout << "PASSED (16/16: " << exactNum << ", 8/16: " << halfNum << ", 0/0: " << zeroZero << ")\n";
}

void testThresholdFlaggingAndAveraging() {
    std::cout << "[Test 5-6] Spec Verification threshold flagging and overall confidence... ";

    std::map<std::string, std::string> claimedText = {
        {"display", "6.7-inch OLED 120Hz"},
        {"processor", "Apple A17 Pro"}
    };
    std::map<std::string, std::string> refText = {
        {"display", "6.7-inch Super Retina XDR OLED 120Hz ProMotion"},
        {"processor", "Apple A17 Pro"}
    };

    std::map<std::string, double> claimedNum = {
        {"ram_gb", 8.0},
        {"battery_mah", 9000.0} // Injected wrong battery spec (should be 4422)
    };
    std::map<std::string, double> refNum = {
        {"ram_gb", 8.0},
        {"battery_mah", 4422.0}
    };

    auto report = verifyDeviceSpecs("DEV-TEST", "Phone Test", claimedText, refText, claimedNum, refNum, 0.85);

    assert(report.totalChecked == 4);
    assert(report.flaggedCount >= 1); // battery_mah should definitely be flagged
    assert(report.verified == false);

    // Hand calculate average:
    double sum = 0;
    for (auto& f : report.fields) {
        sum += f.similarityScore;
        if (f.fieldName == "processor" || f.fieldName == "ram_gb") {
            assert(f.flagged == false);
        }
        if (f.fieldName == "battery_mah") {
            assert(f.flagged == true);
        }
    }
    double expectedAvg = sum / 4.0;
    assert(std::abs(report.overallConfidence - expectedAvg) < 1e-4);

    std::cout << "PASSED (Checked: " << report.totalChecked << ", Flagged: " << report.flaggedCount 
              << ", Confidence: " << report.overallConfidence << ")\n";
}

void testMissingFieldsHandling() {
    std::cout << "[Test 7] Missing / Extra fields handling without crashing... ";

    std::map<std::string, std::string> claimedText = {
        {"extra_claimed_field", "Something"},
        {"common_field", "Matched"}
    };
    std::map<std::string, std::string> refText = {
        {"extra_reference_field", "Something Else"},
        {"common_field", "Matched"}
    };
    std::map<std::string, double> claimedNum = { {"num_1", 100.0} };
    std::map<std::string, double> refNum = { {"num_2", 200.0} };

    auto report = verifyDeviceSpecs("DEV-SPARSE", "Sparse Device", claimedText, refText, claimedNum, refNum, 0.85);

    assert(report.totalChecked == 1);
    assert(report.fields[0].fieldName == "common_field");
    assert(report.verified == true);

    std::cout << "PASSED (Only common fields evaluated, safely skipped disjoint keys)\n";
}

int main() {
    std::cout << "===============================================================\n";
    std::cout << "🧪 SYSTEM 9 TEST SUITE: C++ DATA & SPEC VERIFICATION TESTS\n";
    std::cout << "===============================================================\n";
    testStringComparisons();
    testNumericComparisons();
    testThresholdFlaggingAndAveraging();
    testMissingFieldsHandling();
    std::cout << "\n✅ ALL SYSTEM 9 SPEC VERIFICATION TESTS PASSED SUCCESSFULLY!\n";
    std::cout << "===============================================================\n";
    return 0;
}
