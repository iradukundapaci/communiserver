'use client';

import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Cell, getCells } from '@/lib/api/cells';
import { House, deleteHouse, getHouses } from '@/lib/api/houses';
import { Isibo, getIsibos } from '@/lib/api/isibos';
import { Village, getVillages } from '@/lib/api/villages';
import { useUser } from '@/lib/contexts/user-context';
import { Permission } from '@/lib/permissions';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function HousesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [houses, setHouses] = useState<House[]>([]);
  const [isibos, setIsibos] = useState<Isibo[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [selectedIsiboId, setSelectedIsiboId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isIsibosLoading, setIsIsibosLoading] = useState(true);
  const [isVillagesLoading, setIsVillagesLoading] = useState(true);
  const [isCellsLoading, setIsCellsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCells();
  }, []);

  useEffect(() => {
    if (selectedCellId) {
      fetchVillages();
    }
  }, [selectedCellId]);

  useEffect(() => {
    if (selectedVillageId) {
      fetchIsibos();
    }
  }, [selectedVillageId]);

  useEffect(() => {
    if (selectedIsiboId) {
      fetchHouses();
    }
  }, [selectedIsiboId, currentPage, searchQuery]);

  const fetchCells = async () => {
    try {
      setIsCellsLoading(true);

      // If user has a cell assigned, use it directly without fetching all cells
      if (user?.cell?.id) {
        // For all roles with a cell, pre-select their cell
        setSelectedCellId(user.cell.id);

        // If the user is a location leader, we don't need to fetch all cells
        if (
          user.role === 'CELL_LEADER' ||
          user.role === 'VILLAGE_LEADER' ||
          user.role === 'ISIBO_LEADER'
        ) {
          // Just add the user's cell to the cells array
          // Create a proper Cell object with the required properties
          setCells([
            {
              id: user.cell.id,
              name: user.cell.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Cell,
          ]);
          setIsCellsLoading(false);
          return;
        }
      }

      // Otherwise fetch cells from the database
      const response = await getCells(1, 100); // Get all cells
      setCells(response.items || []);

      // If user doesn't have a cell, select the first one by default
      if (!user?.cell?.id && response.items && response.items.length > 0) {
        setSelectedCellId(response.items[0].id);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch cells');
      }
      console.error(error);
    } finally {
      setIsCellsLoading(false);
    }
  };

  const fetchVillages = async () => {
    if (!selectedCellId) return;

    try {
      setIsVillagesLoading(true);

      // If user has a village assigned and we're in the correct cell, use it directly
      if (user?.village?.id && user?.cell?.id === selectedCellId) {
        // For village leaders and isibo leaders, pre-select their village
        setSelectedVillageId(user.village.id);

        // If the user is a location leader, we don't need to fetch all villages
        if (user.role === 'VILLAGE_LEADER' || user.role === 'ISIBO_LEADER') {
          // Just add the user's village to the villages array
          setVillages([
            {
              id: user.village.id,
              name: user.village.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Village,
          ]);
          setIsVillagesLoading(false);
          return;
        }
      }

      // Otherwise fetch villages from the database
      const response = await getVillages(selectedCellId, 1, 100); // Get all villages for the selected cell
      setVillages(response.items || []);

      // If user has a village in this cell, pre-select it
      if (
        user?.village?.id &&
        response.items.some((village) => village.id === user.village?.id)
      ) {
        setSelectedVillageId(user.village.id);
      } else if (response.items && response.items.length > 0) {
        // Otherwise, select the first village by default
        setSelectedVillageId(response.items[0].id);
      } else {
        setSelectedVillageId('');
        setSelectedIsiboId('');
        setIsibos([]);
        setHouses([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch villages');
      }
      console.error(error);
      setVillages([]);
      setSelectedVillageId('');
      setSelectedIsiboId('');
      setIsibos([]);
      setHouses([]);
    } finally {
      setIsVillagesLoading(false);
    }
  };

  const fetchIsibos = async () => {
    if (!selectedVillageId) return;

    try {
      setIsIsibosLoading(true);

      // If user has an isibo assigned and we're in the correct village, use it directly
      if (user?.isibo?.id && user?.village?.id === selectedVillageId) {
        // For isibo leaders, pre-select their isibo
        setSelectedIsiboId(user.isibo.id);

        // If the user is an isibo leader, we don't need to fetch all isibos
        if (user.role === 'ISIBO_LEADER') {
          // Just add the user's isibo to the isibos array
          setIsibos([
            {
              id: user.isibo.id,
              name: user.isibo.name,
              hasLeader: false, // These values don't matter for the dropdown
              leaderId: null,
            } as Isibo,
          ]);
          setIsIsibosLoading(false);
          return;
        }
      }

      // Otherwise fetch isibos from the database
      const response = await getIsibos(selectedVillageId, 1, 100); // Get all isibos for the selected village
      setIsibos(response.items || []);

      // If user has an isibo in this village, pre-select it
      if (
        user?.isibo?.id &&
        response.items.some((isibo) => isibo.id === user.isibo?.id)
      ) {
        setSelectedIsiboId(user.isibo.id);
      } else if (response.items && response.items.length > 0) {
        // Otherwise, select the first isibo by default
        setSelectedIsiboId(response.items[0].id);
      } else {
        setSelectedIsiboId('');
        setHouses([]);
      }
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch isibos');
      }
      console.error(error);
      setIsibos([]);
      setSelectedIsiboId('');
      setHouses([]);
    } finally {
      setIsIsibosLoading(false);
    }
  };

  const fetchHouses = async () => {
    if (!selectedIsiboId) return;

    try {
      setIsLoading(true);
      const response = await getHouses(
        selectedIsiboId,
        currentPage,
        itemsPerPage,
        searchQuery,
      );
      setHouses(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.totalItems || 0);
      setItemsPerPage(response.meta?.itemsPerPage || 10);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch houses');
      }
      console.error(error);
      setHouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchHouses();
  };

  const handleDeleteHouse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this house?')) {
      try {
        await deleteHouse(id);
        toast.success('House deleted successfully');
        fetchHouses();
      } catch (error: any) {
        if (error.message) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete house');
        }
        console.error(error);
      }
    }
  };

  const handleEditHouse = (id: string) => {
    router.push(`/dashboard/locations/houses/${id}/edit`);
  };

  const handleCellChange = (cellId: string) => {
    setSelectedCellId(cellId);
    setSelectedVillageId(''); // Reset selected village when cell changes
    setSelectedIsiboId(''); // Reset selected isibo when cell changes
    setIsibos([]); // Clear isibos when cell changes
    setHouses([]); // Clear houses when cell changes
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    setSelectedIsiboId(''); // Reset selected isibo when village changes
    setIsibos([]); // Clear isibos when village changes
    setHouses([]); // Clear houses when village changes
  };

  const handleIsiboChange = (isiboId: string) => {
    setSelectedIsiboId(isiboId);
    setCurrentPage(1); // Reset to first page when changing isibo
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Houses Management</h1>

        <PermissionGate permission={Permission.CREATE_HOUSE}>
          <Button
            onClick={() => router.push('/dashboard/locations/houses/create')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create House
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Houses</CardTitle>
          <CardDescription>
            Manage houses in your administrative area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Cell
                </label>
                <Select
                  value={selectedCellId}
                  onValueChange={handleCellChange}
                  disabled={isCellsLoading || Boolean(user?.cell?.id)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cell" />
                  </SelectTrigger>
                  <SelectContent>
                    {cells.map((cell) => (
                      <SelectItem key={cell.id} value={cell.id}>
                        {cell.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Village
                </label>
                <Select
                  value={selectedVillageId}
                  onValueChange={handleVillageChange}
                  disabled={
                    isVillagesLoading ||
                    villages.length === 0 ||
                    Boolean(user?.village?.id)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/4">
                <label className="text-sm font-medium mb-2 block">
                  Select Isibo
                </label>
                <Select
                  value={selectedIsiboId}
                  onValueChange={handleIsiboChange}
                  disabled={
                    isIsibosLoading ||
                    isibos.length === 0 ||
                    Boolean(user?.isibo?.id)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an isibo" />
                  </SelectTrigger>
                  <SelectContent>
                    {isibos.map((isibo) => (
                      <SelectItem key={isibo.id} value={isibo.id}>
                        {isibo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-1/4">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Search
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search houses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      <Button type="submit" className="shrink-0">
                        Search
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !selectedIsiboId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select an isibo to view houses
              </div>
            ) : houses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No houses found
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>House Code</TableHead>
                        <TableHead>House Address</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {houses.map((house) => (
                        <TableRow key={house.id}>
                          <TableCell className="font-medium">
                            {house.code}
                          </TableCell>
                          <TableCell>{house.address || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PermissionGate
                                permission={Permission.UPDATE_HOUSE}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditHouse(house.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </PermissionGate>
                              <PermissionGate
                                permission={Permission.DELETE_HOUSE}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteHouse(house.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            size="default"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            className={
                              currentPage === 1
                                ? 'pointer-events-none opacity-50'
                                : ''
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNumber =
                              currentPage <= 3
                                ? i + 1
                                : currentPage >= totalPages - 2
                                ? totalPages - 4 + i
                                : currentPage - 2 + i;

                            if (pageNumber <= 0 || pageNumber > totalPages)
                              return null;

                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  size="icon"
                                  isActive={currentPage === pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          },
                        )}

                        <PaginationItem>
                          <PaginationNext
                            size="default"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              )
                            }
                            className={
                              currentPage === totalPages
                                ? 'pointer-events-none opacity-50'
                                : ''
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
