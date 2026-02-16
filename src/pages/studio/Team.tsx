import { useState } from "react";
import { Users, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { useStudioMembers, type StudioMember } from "@/hooks/useStudioMembers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "super_admin") {
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Super Admin</Badge>;
  }
  return <Badge variant="secondary">Membro</Badge>;
}

export default function Team() {
  const {
    members, isLoading, error, isAuthorized, currentUserId,
    superAdminCount, updateMemberRole, removeMember,
  } = useStudioMembers();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StudioMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [isProcessing, setIsProcessing] = useState(false);

  const openRoleDialog = (member: StudioMember) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setRoleDialogOpen(true);
  };

  const openRemoveDialog = (member: StudioMember) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    setIsProcessing(true);
    try {
      await updateMemberRole(selectedMember.id, selectedRole);
      toast({
        title: "Permissão atualizada",
        description: `${selectedMember.user.nome_completo} agora é ${selectedRole === "super_admin" ? "Super Admin" : "Membro"}.`,
      });
      setRoleDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao atualizar permissão",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    setIsProcessing(true);
    try {
      await removeMember(selectedMember.id);
      toast({
        title: "Membro removido",
        description: `${selectedMember.user.nome_completo} foi removido da equipe.`,
      });
      setRemoveDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao remover membro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const renderActions = (member: StudioMember) => {
    if (member.user_id === currentUserId) return null;
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => openRoleDialog(member)} title="Alterar permissão">
          <Shield className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => openRemoveDialog(member)} title="Remover membro" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <StudioDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Equipe</h1>
          {!isLoading && isAuthorized && (
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} {members.length === 1 ? "membro" : "membros"}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error / Not authorized */}
        {!isLoading && (error || !isAuthorized) && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{error || "Você não tem permissão para acessar esta página."}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && isAuthorized && members.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">Nenhum membro encontrado</p>
            </CardContent>
          </Card>
        )}

        {/* Members list */}
        {!isLoading && isAuthorized && members.length > 0 && (
          <Card>
            <CardContent className="p-0">
              {isMobile ? (
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <div key={member.id} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{getInitials(member.user.nome_completo)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{member.user.nome_completo}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                        </div>
                        <RoleBadge role={member.role} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Adicionado em {formatDate(member.adicionado_em)}</span>
                        {renderActions(member)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Permissão</TableHead>
                      <TableHead>Adicionado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{getInitials(member.user.nome_completo)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{member.user.nome_completo}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{member.user.email}</TableCell>
                        <TableCell><RoleBadge role={member.role} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(member.adicionado_em)}</TableCell>
                        <TableCell className="text-right">{renderActions(member)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Permissão</DialogTitle>
            <DialogDescription>
              Alterar permissão de {selectedMember?.user.nome_completo}
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={isProcessing || selectedRole === selectedMember?.role}>
              {isProcessing ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove AlertDialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {selectedMember?.user.nome_completo} da equipe? Esta ação pode ser revertida por um administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove} disabled={isProcessing}>
              {isProcessing ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StudioDashboardLayout>
  );
}
