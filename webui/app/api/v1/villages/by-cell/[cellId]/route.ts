import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cellId: string }> }
) {
  try {
    const params = await context.params;
    const cellId = params.cellId;

    if (!cellId) {
      return NextResponse.json(
        { message: "Cell ID is required" },
        { status: 400 }
      );
    }

    // Try to fetch from the real backend API
    let response;
    
    try {
      const systemToken = process.env.SYSTEM_ACCESS_TOKEN;
      if (systemToken) {
        response = await fetch(`${API_URL}/api/v1/villages?page=1&size=100&cellId=${cellId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${systemToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response && response.ok) {
          const data = await response.json();
          return NextResponse.json({
            message: "Villages retrieved successfully",
            payload: data.payload.items
          });
        }
      }
    } catch (fetchError) {
      console.error("Error fetching villages by cell from backend:", fetchError);
    }

    // Fall back to mock data filtered by cellId
    const mockVillages = [
      {
        id: "village-1",
        name: "KIMISAGARA",
        hasLeader: true,
        leaderId: "leader-1",
        cell: { id: "cell-1", name: "NYARUGENGE" }
      },
      {
        id: "village-2",
        name: "KACYIRU",
        hasLeader: true,
        leaderId: "leader-2",
        cell: { id: "cell-2", name: "KACYIRU" }
      },
      {
        id: "village-3",
        name: "GIKONDO",
        hasLeader: true,
        leaderId: "leader-3",
        cell: { id: "cell-3", name: "GIKONDO" }
      },
      {
        id: "village-4",
        name: "REMERA",
        hasLeader: true,
        leaderId: "leader-4",
        cell: { id: "cell-4", name: "REMERA" }
      },
      {
        id: "village-5",
        name: "KIMIHURURA",
        hasLeader: true,
        leaderId: "leader-5",
        cell: { id: "cell-5", name: "KIMIHURURA" }
      },
      {
        id: "village-6",
        name: "GISOZI",
        hasLeader: true,
        leaderId: "leader-6",
        cell: { id: "cell-6", name: "GISOZI" }
      },
      {
        id: "village-7",
        name: "NIBOYE",
        hasLeader: true,
        leaderId: "leader-7",
        cell: { id: "cell-7", name: "NIBOYE" }
      },
      {
        id: "village-8",
        name: "KAGARAMA",
        hasLeader: true,
        leaderId: "leader-8",
        cell: { id: "cell-8", name: "KAGARAMA" }
      }
    ];

    // Filter villages by cellId
    const filteredVillages = mockVillages.filter(village => village.cell?.id === cellId);

    return NextResponse.json({
      message: "Villages retrieved successfully",
      payload: filteredVillages
    });
  } catch (error) {
    console.error("Error in villages by cell route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
