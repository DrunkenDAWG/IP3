package com.example.demo.dto;

public class AuthResponse {

    private String jwtToken;
    private String tokenType = "Bearer";
    private String username;

    public AuthResponse() {
    }

    public AuthResponse(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public AuthResponse(String jwtToken, String username) {
        this.jwtToken = jwtToken;
        this.username = username;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
