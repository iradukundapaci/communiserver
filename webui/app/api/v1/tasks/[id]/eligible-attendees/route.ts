import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    
    // Get authorization header from the request
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}/eligible-attendees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });
    
    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get task eligible attendees API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
