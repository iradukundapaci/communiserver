import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const villageId = searchParams.get("villageId") || "";

    if (!q.trim()) {
      return NextResponse.json({
        message: "Search query is required",
        payload: {
          items: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 50,
            totalPages: 0,
            currentPage: 1,
          }
        }
      });
    }
    
    // Get the access token from the request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Try to fetch from the real backend API
    let response;
    
    try {
      let url = `${API_URL}/api/v1/isibos/search?page=1&size=50&q=${encodeURIComponent(q)}`;
      if (villageId) {
        url += `&villageId=${encodeURIComponent(villageId)}`;
      }

      response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
      });
      
      if (response && response.ok) {
        const data = await response.json();
        return NextResponse.json({
          message: "Isibos search results",
          payload: data.payload  // Return the full paginated response structure
        });
      }
    } catch (fetchError) {
      console.error("Error searching isibos from backend:", fetchError);
    }

    // Fall back to mock search results
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

    // Filter isibos based on search query and optional villageId
    const searchLower = q.toLowerCase();
    let filteredIsibos = mockIsibos.filter(isibo => 
      isibo.name.toLowerCase().includes(searchLower) ||
      isibo.village?.name.toLowerCase().includes(searchLower)
    );

    // Further filter by villageId if provided
    if (villageId) {
      filteredIsibos = filteredIsibos.filter(isibo => isibo.village?.id === villageId);
    }

    return NextResponse.json({
      message: "Isibos search results",
      payload: {
        items: filteredIsibos,
        meta: {
          totalItems: filteredIsibos.length,
          itemCount: filteredIsibos.length,
          itemsPerPage: 50,
          totalPages: 1,
          currentPage: 1,
        }
      }
    });
  } catch (error) {
    console.error("Error in isibos search route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
