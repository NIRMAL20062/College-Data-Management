import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const isPrivileged = false; // Placeholder for user status

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and application settings.</CardDescription>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your current access level within AcademIQ.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h3 className="font-semibold">User Role</h3>
                        <p className="text-sm text-muted-foreground">This determines your permissions.</p>
                    </div>
                    <Badge variant={isPrivileged ? "default" : "secondary"}>
                        {isPrivileged ? "Privileged" : "Student"}
                    </Badge>
                </div>
            </CardContent>
        </Card>

        {!isPrivileged && (
            <Card>
                <CardHeader>
                    <CardTitle>Privileged Access</CardTitle>
                    <CardDescription>Privileged users can post announcements and manage notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                        <p className="text-sm">Want to become a content contributor?</p>
                        <Button>Apply Now</Button>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
