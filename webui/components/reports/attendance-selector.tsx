"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Citizen } from "@/lib/api/reports";
import { Plus, Trash2, Users, UserPlus } from "lucide-react";
import { useState } from "react";

interface AttendanceSelectorProps {
  isiboMembers: Citizen[];
  selectedAttendees: Citizen[];
  onAttendanceChange: (attendees: Citizen[]) => void;
}

export function AttendanceSelector({
  isiboMembers,
  selectedAttendees,
  onAttendanceChange,
}: AttendanceSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAttendee, setNewAttendee] = useState({
    names: "",
    email: "",
    phone: "",
  });

  const handleMemberToggle = (member: Citizen, checked: boolean) => {
    if (checked) {
      // Add member to selected attendees
      const updatedAttendees = [...selectedAttendees, member];
      onAttendanceChange(updatedAttendees);
    } else {
      // Remove member from selected attendees
      const updatedAttendees = selectedAttendees.filter(
        (attendee) =>
          attendee.names !== member.names ||
          attendee.email !== member.email ||
          attendee.phone !== member.phone
      );
      onAttendanceChange(updatedAttendees);
    }
  };

  const isMemberSelected = (member: Citizen) => {
    return selectedAttendees.some(
      (attendee) =>
        attendee.names === member.names &&
        attendee.email === member.email &&
        attendee.phone === member.phone
    );
  };

  const handleAddNewAttendee = () => {
    if (newAttendee.names.trim() && newAttendee.email.trim() && newAttendee.phone.trim()) {
      // Check if attendee already exists
      const exists = selectedAttendees.some(
        (attendee) =>
          attendee.names === newAttendee.names ||
          attendee.email === newAttendee.email ||
          attendee.phone === newAttendee.phone
      );

      if (!exists) {
        const updatedAttendees = [...selectedAttendees, { ...newAttendee }];
        onAttendanceChange(updatedAttendees);
        setNewAttendee({ names: "", email: "", phone: "" });
        setIsModalOpen(false);
      }
    }
  };

  const handleRemoveAttendee = (attendeeToRemove: Citizen) => {
    const updatedAttendees = selectedAttendees.filter(
      (attendee) =>
        attendee.names !== attendeeToRemove.names ||
        attendee.email !== attendeeToRemove.email ||
        attendee.phone !== attendeeToRemove.phone
    );
    onAttendanceChange(updatedAttendees);
  };

  const isNewAttendeeFromIsibo = (attendee: Citizen) => {
    return isiboMembers.some(
      (member) =>
        member.names === attendee.names &&
        member.email === attendee.email &&
        member.phone === attendee.phone
    );
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Reset form when modal is closed
      setNewAttendee({ names: "", email: "", phone: "" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Isibo Members Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Isibo Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isiboMembers.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {isiboMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`member-${index}`}
                    checked={isMemberSelected(member)}
                    onCheckedChange={(checked) =>
                      handleMemberToggle(member, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`member-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{member.names}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.email} • {member.phone}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No members found in this isibo.</p>
          )}
        </CardContent>
      </Card>

      {/* Add Additional Attendees Button */}
      <div className="flex justify-center">
        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full max-w-md">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Additional Attendees
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Additional Attendee</DialogTitle>
              <DialogDescription>
                Add someone who attended but is not on the isibo member list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modal-names" className="text-right">
                  Full Names
                </Label>
                <Input
                  id="modal-names"
                  value={newAttendee.names}
                  onChange={(e) =>
                    setNewAttendee((prev) => ({ ...prev, names: e.target.value }))
                  }
                  className="col-span-3"
                  placeholder="Enter full names"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modal-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  value={newAttendee.email}
                  onChange={(e) =>
                    setNewAttendee((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="col-span-3"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modal-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="modal-phone"
                  value={newAttendee.phone}
                  onChange={(e) =>
                    setNewAttendee((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="col-span-3"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModalClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddNewAttendee}
                disabled={
                  !newAttendee.names.trim() ||
                  !newAttendee.email.trim() ||
                  !newAttendee.phone.trim()
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attendee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected Attendees Summary */}
      {selectedAttendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Attendees ({selectedAttendees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {selectedAttendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{attendee.names}</span>
                    <span className="text-sm text-muted-foreground">
                      {attendee.email} • {attendee.phone}
                    </span>
                    {isNewAttendeeFromIsibo(attendee) && (
                      <span className="text-xs text-blue-600">Isibo Member</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttendee(attendee)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
