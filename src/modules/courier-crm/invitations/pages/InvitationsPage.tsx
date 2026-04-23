import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SendInvitationForm from "@/modules/courier-crm/invitations/components/SendInvitationForm";
import InvitationList from "@/modules/courier-crm/invitations/components/InvitationList";

export default function InvitationsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInvitationSent = () => {
    setActiveTab("list");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-gray-500 mt-2">
            Invite and manage riders and staff (admin/operations)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Invitations</TabsTrigger>
          <TabsTrigger value="send">Send Invitation</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-8">
          <InvitationList key={refreshTrigger} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="send" className="mt-8">
          <div className="max-w-2xl mx-auto">
            <SendInvitationForm onSuccess={handleInvitationSent} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
