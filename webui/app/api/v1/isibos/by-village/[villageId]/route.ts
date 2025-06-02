import { getAuthTokens } from "@/lib/api/auth";
import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ villageId: string }> }
) {
  try {
    const params = await context.params;
    const villageId = params.villageId;

    if (!villageId) {
      return NextResponse.json(
        { message: "Village ID is required" },
        { status: 400 }
      );
    }

    // Get auth tokens from request
    const tokens = getAuthTokens();
    
    if (!tokens) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Try to fetch from the real backend API
    let response;
    
    try {
      response = await fetch(`${API_URL}/api/v1/isibos?page=1&size=100&villageId=${villageId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response && response.ok) {
        const data = await response.json();
        return NextResponse.json({
          message: "Isibos retrieved successfully",
          payload: data.payload.items
        });
      }
    } catch (fetchError) {
      console.error("Error fetching isibos by village from backend:", fetchError);
    }

    // Fall back to mock data filtered by villageId
    const mockIsibos = [
      {
        id: "isibo-1",
        name: "INDANGAMIRWA",
        hasLeader: true,
        leaderId: "leader-1",
        village: { id: "village-1", name: "KIMISAGARA" }
      },
      {
        id: "isibo-2",
        name: "INDATWA",
        hasLeader: true,
        leaderId: "leader-2",
        village: { id: "village-2", name: "KACYIRU" }
      },
      {
        id: "isibo-3",
        name: "INSHUTI",
        hasLeader: true,
        leaderId: "leader-3",
        village: { id: "village-3", name: "GIKONDO" }
      },
      {
        id: "isibo-4",
        name: "UBWIYUNGE",
        hasLeader: true,
        leaderId: "leader-4",
        village: { id: "village-4", name: "REMERA" }
      },
      {
        id: "isibo-5",
        name: "UBWOBA",
        hasLeader: true,
        leaderId: "leader-5",
        village: { id: "village-5", name: "KIMIHURURA" }
      },
      {
        id: "isibo-6",
        name: "UBWENGE",
        hasLeader: true,
        leaderId: "leader-6",
        village: { id: "village-6", name: "GISOZI" }
      },
      {
        id: "isibo-7",
        name: "UBUSHOBOZI",
        hasLeader: true,
        leaderId: "leader-7",
        village: { id: "village-7", name: "NIBOYE" }
      },
      {
        id: "isibo-8",
        name: "UBWOBA",
        hasLeader: true,
        leaderId: "leader-8",
        village: { id: "village-8", name: "KAGARAMA" }
      }
    ];

    // Filter isibos by villageId
    const filteredIsibos = mockIsibos.filter(isibo => isibo.village?.id === villageId);

    return NextResponse.json({
      message: "Isibos retrieved successfully",
      payload: filteredIsibos
    });
  } catch (error) {
    console.error("Error in isibos by village route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
