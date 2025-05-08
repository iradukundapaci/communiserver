import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    // Get the access token from the request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization token is required" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/isibos${queryString ? `?${queryString}` : ''}`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get isibos API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the access token from the request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization token is required" },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/isibos`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create isibo API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
