"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import { TaskAttendee } from "@/lib/api/tasks";
import { Trash2, Users, Home } from "lucide-react";

interface AttendanceSelectorProps {
  houseMembers: TaskAttendee[];
  selectedAttendeeIds: string[];
  onAttendanceChange: (attendeeIds: string[]) => void;
}

export function AttendanceSelector({
  houseMembers,
  selectedAttendeeIds,
  onAttendanceChange,
}: AttendanceSelectorProps) {
  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      // Add member to selected attendees
      const updatedAttendeeIds = [...selectedAttendeeIds, memberId];
      onAttendanceChange(updatedAttendeeIds);
    } else {
      // Remove member from selected attendees
      const updatedAttendeeIds = selectedAttendeeIds.filter(id => id !== memberId);
      onAttendanceChange(updatedAttendeeIds);
    }
  };

  const isMemberSelected = (memberId: string) => {
    return selectedAttendeeIds.includes(memberId);
  };

  const getSelectedMembers = () => {
    return houseMembers.filter(member => selectedAttendeeIds.includes(member.id));
  };

  return (
    <div className="space-y-6">
      {/* House Members Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            House Members ({selectedAttendeeIds.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {houseMembers.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {houseMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={isMemberSelected(member.id)}
                    onCheckedChange={(checked) =>
                      handleMemberToggle(member.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`member-${member.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{member.names}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.email} • {member.phone}
                      </span>
                      {member.house && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          House {member.house.code}
                          {member.house.address && ` - ${member.house.address}`}
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No house members found for this task's isibo.</p>
          )}
        </CardContent>
      </Card>


    </div>
  );
}
