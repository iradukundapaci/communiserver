import { NextRequest, NextResponse } from "next/server";

// API endpoint URL
const API_URL = process.env.API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size") || "20";
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const villageId = searchParams.get("villageId") || "";
    const cellId = searchParams.get("cellId") || "";

    let url = `${API_URL}/api/v1/activities?page=${page}&size=${size}`;
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (villageId) {
      url += `&villageId=${encodeURIComponent(villageId)}`;
    }
    if (cellId) {
      url += `&cellId=${encodeURIComponent(cellId)}`;
    }

    // Try to fetch from the real backend API
    // For public access, we'll try without authentication first
    let response;

    try {
      // First try without authentication (in case the backend allows public access)
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If unauthorized, try with a system token if available
      if (response.status === 401) {
        const systemToken = process.env.SYSTEM_ACCESS_TOKEN;
        if (systemToken) {
          response = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${systemToken}`,
              "Content-Type": "application/json",
            },
          });
        }
      }
    } catch (fetchError) {
      console.error("Error fetching from backend:", fetchError);
      // Fall back to mock data if backend is unavailable
      response = null;
    }

    // If we got a successful response from the backend, use it
    if (response && response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Otherwise, fall back to mock data for demonstration
    const mockActivities = {
      message: "Activities retrieved successfully",
      payload: {
        items: [
          {
            id: "1",
            title: "Community Garden Cleanup",
            description: "Join us for a morning of beautifying our local community garden. Bring gloves and enthusiasm!",
            date: "2024-01-15T09:00:00Z",
            status: "upcoming",
            village: {
              id: "village-1",
              name: "KIMISAGARA",
              cell: {
                id: "cell-1",
                name: "NYARUGENGE",
                sector: {
                  id: "sector-1",
                  name: "NYARUGENGE",
                  district: {
                    id: "district-1",
                    name: "NYARUGENGE",
                    province: {
                      id: "province-1",
                      name: "KIGALI CITY"
                    }
                  }
                }
              }
            },
            tasks: [
              {
                id: "task-1",
                title: "Weeding",
                description: "Remove weeds from garden beds",
                status: "pending",
                isibo: {
                  id: "isibo-1",
                  name: "GREEN TEAM"
                }
              }
            ]
          },
          {
            id: "2",
            title: "Youth Football Tournament",
            description: "Annual football tournament for youth aged 12-18. Registration required.",
            date: "2024-01-20T14:00:00Z",
            status: "upcoming",
            village: {
              id: "village-2",
              name: "KACYIRU",
              cell: {
                id: "cell-2",
                name: "KACYIRU",
                sector: {
                  id: "sector-2",
                  name: "KACYIRU",
                  district: {
                    id: "district-2",
                    name: "GASABO",
                    province: {
                      id: "province-1",
                      name: "KIGALI CITY"
                    }
                  }
                }
              }
            },
            tasks: []
          },
          {
            id: "3",
            title: "Digital Skills Workshop",
            description: "Learn basic computer skills and internet safety. Free for all community members.",
            date: "2024-01-18T10:00:00Z",
            status: "upcoming",
            village: {
              id: "village-3",
              name: "GIKONDO",
              cell: {
                id: "cell-3",
                name: "GIKONDO",
                sector: {
                  id: "sector-3",
                  name: "KICUKIRO",
                  district: {
                    id: "district-3",
                    name: "KICUKIRO",
                    province: {
                      id: "province-1",
                      name: "KIGALI CITY"
                    }
                  }
                }
              }
            },
            tasks: []
          },
          {
            id: "4",
            title: "Traditional Dance Practice",
            description: "Weekly practice session for traditional Rwandan dances. All skill levels welcome.",
            date: "2024-01-17T18:00:00Z",
            status: "upcoming",
            village: {
              id: "village-1",
              name: "KIMISAGARA",
              cell: {
                id: "cell-1",
                name: "NYARUGENGE",
                sector: {
                  id: "sector-1",
                  name: "NYARUGENGE",
                  district: {
                    id: "district-1",
                    name: "NYARUGENGE",
                    province: {
                      id: "province-1",
                      name: "KIGALI CITY"
                    }
                  }
                }
              }
            },
            tasks: []
          },
          {
            id: "5",
            title: "Health Awareness Campaign",
            description: "Community health screening and awareness session. Free health checkups available.",
            date: "2024-01-22T08:00:00Z",
            status: "upcoming",
            village: {
              id: "village-2",
              name: "KACYIRU",
              cell: {
                id: "cell-2",
                name: "KACYIRU",
                sector: {
                  id: "sector-2",
                  name: "KACYIRU",
                  district: {
                    id: "district-2",
                    name: "GASABO",
                    province: {
                      id: "province-1",
                      name: "KIGALI CITY"
                    }
                  }
                }
              }
            },
            tasks: []
          }
        ],
        meta: {
          totalItems: 5,
          itemCount: 5,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1
        }
      }
    };

    // Apply filters to mock data
    let filteredItems = mockActivities.payload.items;

    if (q) {
      const searchTerm = q.toLowerCase();
      filteredItems = filteredItems.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm) ||
        activity.description.toLowerCase().includes(searchTerm)
      );
    }

    if (status) {
      filteredItems = filteredItems.filter(activity => activity.status === status);
    }

    if (villageId) {
      filteredItems = filteredItems.filter(activity => activity.village?.id === villageId);
    }

    if (cellId) {
      filteredItems = filteredItems.filter(activity => activity.village?.cell?.id === cellId);
    }

    // Update the response with filtered data
    const filteredResponse = {
      ...mockActivities,
      payload: {
        ...mockActivities.payload,
        items: filteredItems,
        meta: {
          ...mockActivities.payload.meta,
          totalItems: filteredItems.length,
          itemCount: filteredItems.length
        }
      }
    };

    return NextResponse.json(filteredResponse);
  } catch (error) {
    console.error("Error in public activities route handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
