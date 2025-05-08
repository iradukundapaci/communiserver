// Authentication API service
import { jwtDecode } from "jwt-decode";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  message: string;
  payload: T;
}

interface JwtPayload {
  exp: number;
  iat: number;
  id: string;
  role: string;
  sub: string;
}

/**
 * Login user with email and password
 * @param credentials User credentials
 * @returns Promise with auth tokens
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthTokens> {
  try {
    // Use the API route we created to proxy the request to the backend
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data: ApiResponse<AuthTokens> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Store auth tokens in localStorage
 * @param tokens Auth tokens to store
 */
export function storeAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
}

/**
 * Get stored auth tokens from localStorage
 * @returns Auth tokens or null if not found
 */
export function getAuthTokens(): AuthTokens | null {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

/**
 * Clear auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthTokens();
}

/**
 * Refresh access token using refresh token
 * @returns Promise with new auth tokens
 */
export async function refreshTokens(): Promise<AuthTokens> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("/api/v1/auth/refresh-token", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Token refresh failed");
    }

    const data: ApiResponse<AuthTokens> = await response.json();
    storeAuthTokens(data.payload);
    return data.payload;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAuthTokens();
    throw error;
  }
}

/**
 * Check if access token is expired
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired(): boolean {
  try {
    const tokens = getAuthTokens();
    if (!tokens) return true;

    const { accessToken } = tokens;
    const decoded = jwtDecode<JwtPayload>(accessToken);

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return true;
  }
}

/**
 * Get authenticated user info from token
 * @returns User info from token or null if not authenticated
 */
export function getUserFromToken(): {
  id: string;
  email: string;
  role: string;
} | null {
  try {
    const tokens = getAuthTokens();
    if (!tokens) return null;

    const { accessToken } = tokens;
    const decoded = jwtDecode<JwtPayload>(accessToken);

    return {
      id: decoded.id,
      email: decoded.sub,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Get user from token error:", error);
    return null;
  }
}

/**
 * Request password reset email
 * @param email User email
 * @returns Promise with success message
 */
export async function forgotPassword(email: string): Promise<string> {
  try {
    const response = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.message === "User not found") {
        return "If your email exists in our system, you will receive password reset instructions shortly.";
      }

      // For other errors, we'll throw an exception
      throw new Error(errorData.message || "Failed to request password reset");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 * @param password New password
 * @param token Reset token from email
 * @returns Promise with success message
 */
export async function resetPassword(
  password: string,
  token: string
): Promise<string> {
  try {
    const response = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reset password");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}
