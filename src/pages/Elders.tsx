import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, MessageCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { elderApi, Elder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Use the Elder interface from the API directly
type Resident = Elder;

const Elders = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isNewResidentOpen, setIsNewResidentOpen] = useState(false);
  const [newResidentName, setNewResidentName] = useState("");
  const [newResidentDetails, setNewResidentDetails] = useState("");
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch residents from API
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setIsLoading(true);
        const eldersData = await elderApi.list();
        setResidents(eldersData);
      } catch (error) {
        console.error("Error fetching residents:", error);
        toast({
          title: "Error",
          description: "Failed to load residents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResidents();
  }, [toast]);

  const handleCreateResident = async () => {
    if (!newResidentName.trim()) return;


    setIsCreating(true);

    try {
      // Create the elder first
      const newElder = await elderApi.create({
        name: newResidentName,
        extra_details: newResidentDetails,
      });

      // If there's an audio file, upload it
      if (selectedAudioFile) {
        await elderApi.uploadAudio(newElder.id!, selectedAudioFile);
      }

      // Add the new resident to the list
      setResidents([...residents, newElder]);

      toast({
        title: "Success!",
        description: `${newResidentName} has been added successfully.`,
      });

      // Reset form and close dialog
      setNewResidentName("");
      setNewResidentDetails("");
      setSelectedAudioFile(null);
      setIsNewResidentOpen(false);
    } catch (error) {
      console.error("Error creating resident:", error);
      toast({
        title: "Error",
        description: "Failed to create resident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleChatWithResident = (residentId: number) => {
    navigate(`/elders/${residentId}/chat`);
  };

  const handleDeleteResident = async (residentId: number, residentName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${residentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await elderApi.delete(residentId);
      setResidents(residents.filter(resident => resident.id !== residentId));
      toast({
        title: "Success!",
        description: `${residentName} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting resident:", error);
      toast({
        title: "Error",
        description: "Failed to delete resident. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(to bottom right, #AFD0CD, #EFD492)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#7F4F61] mb-2">
              Resident Profiles
            </h1>
            <p className="text-[#7F4F61]">
              Manage resident information and preferences
            </p>
          </div>

          <Dialog open={isNewResidentOpen} onOpenChange={setIsNewResidentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#C08777] hover:bg-[#C08777]/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add New Resident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-[#7F4F61]">
                  Add New Resident
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-[#7F4F61] mb-2 block">
                    Name *
                  </label>
                  <Input
                    value={newResidentName}
                    onChange={(e) => setNewResidentName(e.target.value)}
                    placeholder="Enter resident's name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#7F4F61] mb-2 block">
                    Additional Details
                  </label>
                  <Textarea
                    value={newResidentDetails}
                    onChange={(e) => setNewResidentDetails(e.target.value)}
                    placeholder="Any additional information about preferences, background, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#7F4F61] mb-2 block">
                    Initial Audio Recording (Optional)
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) =>
                      setSelectedAudioFile(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 border border-[#C08777]/30 rounded-md"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewResidentOpen(false)}
                    className="border-[#C08777]/30 text-[#7F4F61]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateResident}
                    disabled={!newResidentName.trim() || isCreating}
                    className="bg-[#C08777] hover:bg-[#C08777]/90 text-white"
                  >
                    {isCreating ? "Creating..." : "Create Resident Profile"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-[#7F4F61]">Loading residents...</div>
          </div>
        ) : residents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#7F4F61] text-lg mb-4">No residents found</p>
            <p className="text-[#7F4F61]/70">
              Add your first resident to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {residents.map((resident) => (
              <Card
                key={resident.id}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-[#7F4F61]"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#7F4F61] flex items-center justify-between">
                    {resident.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleChatWithResident(resident.id)}
                      className="text-[#C08777] hover:text-[#7F4F61] hover:bg-[#AFD0CD]/30"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resident.summary && (
                    <div className="mb-4">
                      <p className="text-sm text-[#7F4F61] mb-2 font-medium">
                        Summary:
                      </p>
                      <p className="text-sm text-[#7F4F61]/80 leading-relaxed">
                        {resident.summary.short_summary}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-[#AFD0CD]/30">
                    <span className="text-xs text-[#7F4F61]/60">
                      Added {new Date(resident.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#C08777] border-[#C08777]/30 hover:bg-[#C08777]/10"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => handleDeleteResident(resident.id!, resident.name)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elders;
