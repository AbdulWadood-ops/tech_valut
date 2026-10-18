#ifndef LIBCURL_FETCHER_HPP
#define LIBCURL_FETCHER_HPP

#include <string>
#include <iostream>

// Note: Requires libcurl library when compiled with -lcurl
#ifdef USE_LIBCURL
#include <curl/curl.h>

inline size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* output) {
    size_t totalSize = size * nmemb;
    if (output) output->append((char*)contents, totalSize);
    return totalSize;
}

inline std::string fetchReferenceData(const std::string& url) {
    CURL* curl = curl_easy_init();
    std::string response;
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);
        curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return response;
}
#else
// Mock / Standalone fetcher when compiling without external libcurl DLL
inline std::string fetchReferenceData(const std::string& url) {
    return "{\"status\":\"ok\",\"source\":\"reference_api\",\"url\":\"" + url + "\"}";
}
#endif

#endif // LIBCURL_FETCHER_HPP
