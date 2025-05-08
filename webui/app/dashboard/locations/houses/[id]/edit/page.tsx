"use client";

import { PermissionRoute } from "@/components/permission-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHouseById, updateHouse } from "@/lib/api/houses";
import { Permission } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditHousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const [formData, setFormData] = useState({
    code: "",
    street: "",
    isiboId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHouse();
  }, [id]);

  const fetchHouse = async () => {
    try {
      setIsLoading(true);
      const house = await getHouseById(id);

      // Set the form data
      setFormData({
        code: house.code,
        street: house.street || "",
        isiboId: house.isibo?.id || "",
      });
    } catch (error: any) {
      // Display a more specific error message if available
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch house");
      }
      console.error(error);
      // Redirect back to the houses list if there's an error
      router.push("/dashboard/locations/houses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("House code is required");
      return;
    }

    setIsSaving(true);

    try {
      // Only send the code and street when updating the house
      await updateHouse(id, {
        code: formData.code,
        street: formData.street,
      });
      toast.success("House updated successfully");
      router.push("/dashboard/locations/houses");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update house");
      }
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PermissionRoute permission={Permission.UPDATE_HOUSE}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/locations/houses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit House</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>House Information</CardTitle>
              <CardDescription>
                Update the details for this house
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">House Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter house code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street (Optional)</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isiboId">Isibo</Label>
                <Select
                  value={formData.isiboId}
                  disabled={true} /* Always disabled in edit mode */
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an isibo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={formData.isiboId}>
                      {/* We don't have the isibo name here, but it's disabled anyway */}
                      {formData.isiboId}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Isibo cannot be changed when editing a house
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/locations/houses")}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PermissionRoute>
  );
}
