import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

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
      if (systemToken) {
        response = await fetch(`${API_URL}/api/v1/cells?page=1&size=50&q=${encodeURIComponent(q)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${systemToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response && response.ok) {
          const data = await response.json();
          // Transform the paginated response to just return the items
          return NextResponse.json({
            message: "Cells search results",
            payload: data.payload.items
          });
        }
      }
    } catch (fetchError) {
      console.error("Error searching cells from backend:", fetchError);
    }

    // Fall back to mock search results
    const mockCells = [
      {
        id: "cell-1",
        name: "NYARUGENGE",
        hasLeader: true,
        leaderId: "leader-1",
        sector: { id: "sector-1", name: "NYARUGENGE" }
      },
      {
        id: "cell-2", 
        name: "KACYIRU",
        hasLeader: true,
        leaderId: "leader-2",
        sector: { id: "sector-2", name: "KACYIRU" }
      },
      {
        id: "cell-3",
        name: "GIKONDO", 
        hasLeader: true,
        leaderId: "leader-3",
        sector: { id: "sector-3", name: "KICUKIRO" }
      },
      {
        id: "cell-4",
        name: "REMERA",
        hasLeader: true,
        leaderId: "leader-4",
        sector: { id: "sector-4", name: "REMERA" }
      },
      {
        id: "cell-5",
        name: "KIMIHURURA",
        hasLeader: true,
        leaderId: "leader-5", 
        sector: { id: "sector-5", name: "KIMIHURURA" }
      },
      {
        id: "cell-6",
        name: "GISOZI",
        hasLeader: true,
        leaderId: "leader-6",
        sector: { id: "sector-6", name: "GISOZI" }
      },
      {
        id: "cell-7",
        name: "NIBOYE",
        hasLeader: true,
        leaderId: "leader-7",
        sector: { id: "sector-7", name: "NIBOYE" }
      },
      {
        id: "cell-8",
        name: "KAGARAMA",
        hasLeader: true,
        leaderId: "leader-8",
        sector: { id: "sector-8", name: "KAGARAMA" }
      }
    ];

    // Filter cells based on search query
    const searchLower = q.toLowerCase();
    const filteredCells = mockCells.filter(cell => 
      cell.name.toLowerCase().includes(searchLower) ||
      cell.sector?.name.toLowerCase().includes(searchLower)
    );

    return NextResponse.json({
      message: "Cells search results",
      payload: filteredCells
    });
  } catch (error) {
    console.error("Error in cells search route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
