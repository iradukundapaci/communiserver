import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const cellId = searchParams.get("cellId") || "";

    if (!q.trim()) {
      return NextResponse.json({
        message: "Search query is required",
        payload: []
      });
    }

    // Try to fetch from the real backend API
    let response;
    
    try {
      const systemToken = process.env.SYSTEM_ACCESS_TOKEN;
      if (systemToken && cellId) {
        // Search villages within a specific cell
        response = await fetch(`${API_URL}/api/v1/villages?page=1&size=50&cellId=${cellId}&q=${encodeURIComponent(q)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${systemToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response && response.ok) {
          const data = await response.json();
          return NextResponse.json({
            message: "Villages search results",
            payload: data.payload.items
          });
        }
      }
    } catch (fetchError) {
      console.error("Error searching villages from backend:", fetchError);
    }

    // Fall back to mock search results
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

    // Filter villages based on search query and optional cellId
    const searchLower = q.toLowerCase();
    let filteredVillages = mockVillages.filter(village => 
      village.name.toLowerCase().includes(searchLower) ||
      village.cell?.name.toLowerCase().includes(searchLower)
    );

    // Further filter by cellId if provided
    if (cellId) {
      filteredVillages = filteredVillages.filter(village => village.cell?.id === cellId);
    }

    return NextResponse.json({
      message: "Villages search results",
      payload: filteredVillages
    });
  } catch (error) {
    console.error("Error in villages search route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
