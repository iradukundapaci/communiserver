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
        response = await fetch(`${API_URL}/api/v1/sectors?page=1&size=50&q=${encodeURIComponent(q)}`, {
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
            message: "Sectors search results",
            payload: data.payload.items
          });
        }
      }
    } catch (fetchError) {
      console.error("Error searching sectors from backend:", fetchError);
    }

    // Fallback to mock data if backend is not available
    const mockSectors = [
      {
        id: "sector-1",
        name: "GITEGA",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-2",
        name: "KANYINYA",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-3",
        name: "KIGALI",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-4",
        name: "KIMISAGARA",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-5",
        name: "MAGERAGERE",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-6",
        name: "MUHIMA",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-7",
        name: "NYAKABANDA",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-8",
        name: "NYAMIRAMBO",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-9",
        name: "NYARUGENGE",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-10",
        name: "RWEZAMENYO",
        district: { id: "district-1", name: "NYARUGENGE" }
      },
      {
        id: "sector-11",
        name: "BUMBOGO",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-12",
        name: "GATSATA",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-13",
        name: "GIKOMERO",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-14",
        name: "GISOZI",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-15",
        name: "JABANA",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-16",
        name: "JALI",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-17",
        name: "KACYIRU",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-18",
        name: "KIMIHURURA",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-19",
        name: "KIMIRONKO",
        district: { id: "district-2", name: "GASABO" }
      },
      {
        id: "sector-20",
        name: "KINYINYA",
        district: { id: "district-2", name: "GASABO" }
      }
    ];

    // Filter sectors based on search query
    const searchLower = q.toLowerCase();
    const filteredSectors = mockSectors.filter(sector => 
      sector.name.toLowerCase().includes(searchLower) ||
      sector.district?.name.toLowerCase().includes(searchLower)
    );

    return NextResponse.json({
      message: "Sectors search results",
      payload: filteredSectors
    });

  } catch (error) {
    console.error("Sectors search error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        payload: []
      },
      { status: 500 }
    );
  }
}
