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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size") || "10";
    const activityId = searchParams.get("activityId") || "";
    const taskId = searchParams.get("taskId") || "";
    const isiboId = searchParams.get("isiboId") || "";

    let url = `${API_URL}/api/v1/reports?page=${page}&size=${size}`;
    if (activityId) {
      url += `&activityId=${encodeURIComponent(activityId)}`;
    }
    if (taskId) {
      url += `&taskId=${encodeURIComponent(taskId)}`;
    }
    if (isiboId) {
      url += `&isiboId=${encodeURIComponent(isiboId)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in reports route handler:", error);
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

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/reports`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in reports route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
