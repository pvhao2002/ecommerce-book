package com.be.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StandardApiResponse<T> {

    private String version;
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String requestId;
    private Map<String, Object> metadata;
    private ErrorDetails error;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetails {
        private String code;
        private String message;
        private String field;
        private Object rejectedValue;
        private Map<String, Object> details;
    }

    public static <T> StandardApiResponse<T> success(T data) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> success(T data, String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> success(T data, String message, String version) {
        return StandardApiResponse.<T>builder()
                .version(version)
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> success(String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> error(String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> error(String message, ErrorDetails errorDetails) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(false)
                .message(message)
                .error(errorDetails)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> StandardApiResponse<T> error(String message, ErrorDetails errorDetails, String version) {
        return StandardApiResponse.<T>builder()
                .version(version)
                .success(false)
                .message(message)
                .error(errorDetails)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public StandardApiResponse<T> withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }
}