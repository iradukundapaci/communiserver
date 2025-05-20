import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Get the access token from the request headers
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/isibos/${id}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Handle the case where the backend returns an error about houses
    if (!response.ok && data.message && data.message.includes("houses")) {
      // Return a more user-friendly error message
      return NextResponse.json(
        {
          message:
            "There was an issue with the backend. The administrator needs to update the isibo service to remove house references.",
        },
        { status: 500 }
      );
    }

    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get isibo API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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
    const response = await fetch(`${API_URL}/api/v1/isibos/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Handle the case where the backend returns an error about houses
    if (!response.ok && data.message && data.message.includes("houses")) {
      // Return a more user-friendly error message
      return NextResponse.json(
        {
          message:
            "There was an issue with the backend. The administrator needs to update the isibo service to remove house references.",
        },
        { status: 500 }
      );
    }

    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Update isibo API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Get the access token from the request headers
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/v1/isibos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Handle the case where the backend returns an error about houses
    if (!response.ok && data.message && data.message.includes("houses")) {
      // Return a more user-friendly error message
      return NextResponse.json(
        {
          message:
            "There was an issue with the backend. The administrator needs to update the isibo service to remove house references.",
        },
        { status: 500 }
      );
    }

    // Return the response from the backend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Delete isibo API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
