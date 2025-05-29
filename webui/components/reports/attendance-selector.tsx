"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import { IsiboMember } from "@/lib/api/isibos";
import { Trash2, Users } from "lucide-react";

interface AttendanceSelectorProps {
  isiboMembers: IsiboMember[];
  selectedAttendeeIds: string[];
  onAttendanceChange: (attendeeIds: string[]) => void;
}

export function AttendanceSelector({
  isiboMembers,
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
    return isiboMembers.filter(member => selectedAttendeeIds.includes(member.id));
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
              {isiboMembers.map((member) => (
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
                        {member.user.email} • {member.user.phone}
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

      {/* Selected Attendees Summary */}
      {selectedAttendeeIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Attendees ({selectedAttendeeIds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {getSelectedMembers().map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{member.names}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.user.email} • {member.user.phone}
                    </span>
                    <span className="text-xs text-blue-600">Isibo Member</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMemberToggle(member.id, false)}
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
