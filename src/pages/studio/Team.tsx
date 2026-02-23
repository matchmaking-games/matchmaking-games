import { useState } from "react";
import { Users, Shield, Trash2, UserPlus, MoreVertical, User, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StudioDashboardLayout } from "@/components/studio/StudioDashboardLayout";
import { useStudioMembers, type StudioMember } from "@/hooks/useStudioMembers";
import { useActiveStudio } from "@/hooks/useActiveStudio";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InviteMemberDialog } from "@/components/studio/InviteMemberDialog";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "super_admin") {
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Super Admin</Badge>;
  }
  return <Badge variant="secondary">Membro</Badge>;
}

export default function Team() {
  const { activeStudio } = useActiveStudio();
  const estudioId = activeStudio?.estudio.id ?? null;
  const {
    members, isLoading, error, currentUserId,
    superAdminCount, updateMemberRole, removeMember, refetch,
  } = useStudioMembers(estudioId);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StudioMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const openRoleDialog = (member: StudioMember) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setRoleDialogOpen(true);
  };

  const openRemoveDialog = (member: StudioMember) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const handleRoleClick = (member: StudioMember) => {
    if (member.role === "super_admin" && superAdminCount <= 1) {
      if (member.user_id === currentUserId) {
        toast({ title: "Ação não permitida", description: "Você não pode remover sua própria permissão de Super Admin.", variant: "destructive" });
      } else {
        toast({ title: "Ação não permitida", description: "O estúdio precisa ter pelo menos um Super Admin.", variant: "destructive" });
      }
      return;
    }
    openRoleDialog(member);
  };

  const handleRemoveClick = (member: StudioMember) => {
    if (member.user_id === currentUserId) {
      toast({ title: "Ação não permitida", description: "Você não pode remover a si mesmo. Peça para outro Super Admin fazer isso.", variant: "destructive" });
      return;
    }
    if (member.role === "super_admin" && superAdminCount <= 1) {
      toast({ title: "Ação não permitida", description: "Não é possível remover. O estúdio precisa ter pelo menos um Super Admin.", variant: "destructive" });
      return;
    }
    openRemoveDialog(member);
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    setIsProcessing(true);
    try {
      await updateMemberRole(selectedMember.id, selectedRole);
      toast({
        title: "Permissão atualizada",
        description: `Permissão de ${selectedMember.user.nome_completo} alterada para ${selectedRole === "super_admin" ? "Super Admin" : "Membro"}.`,
      });
      setRoleDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao alterar permissão",
        description: err instanceof Error ? err.message : "Tente novamente.",
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
        description: `${selectedMember.user.nome_completo} foi removido do estúdio.`,
      });
      setRemoveDialogOpen(false);
    } catch (err) {
      toast({
        title: "Erro ao remover membro",
        description: err instanceof Error ? err.message : "Tente novamente.",
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

  const renderActions = (member: StudioMember) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!member.user.slug}
          onClick={() => member.user.slug && window.open(`/p/${member.user.slug}`, '_blank')}
        >
          <User className="mr-2 h-4 w-4" />
          Ver Perfil Público
        </DropdownMenuItem>
        {activeStudio?.role === "super_admin" && (
          <>
            <DropdownMenuItem onClick={() => handleRoleClick(member)}>
              <Shield className="mr-2 h-4 w-4" />
              Alterar Permissão
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleRemoveClick(member)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover do Estúdio
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <StudioDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Equipe</h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} {members.length === 1 ? "membro" : "membros"}
              </p>
            )}
          </div>
          {!isLoading && activeStudio?.role === "super_admin" && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Membro
            </Button>
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

        {/* Error */}
        {!isLoading && error && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && members.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">Nenhum membro encontrado</p>
            </CardContent>
          </Card>
        )}

        {/* Members list */}
        {!isLoading && !error && members.length > 0 && (
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
                        <div className="flex items-center gap-2">
                          <RoleBadge role={member.role} />
                          {renderActions(member)}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Adicionado em {formatDate(member.adicionado_em)}</span>
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
              Altere a permissão deste membro do estúdio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Membro:</span>{" "}
                {selectedMember?.user.nome_completo}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Permissão atual:</span>
                {selectedMember && <RoleBadge role={selectedMember.role} />}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Nova permissão:</Label>
              <RadioGroup value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <div className="flex items-start space-x-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="member" id="role-member" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="role-member" className="font-medium cursor-pointer">Membro</Label>
                    <p className="text-xs text-muted-foreground">Pode editar perfil do estúdio e gerenciar vagas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border border-border p-3">
                  <RadioGroupItem value="super_admin" id="role-super-admin" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="role-super-admin" className="font-medium cursor-pointer">Super Admin</Label>
                    <p className="text-xs text-muted-foreground">Controle total, incluindo gerenciar equipe</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={isProcessing || selectedRole === selectedMember?.role}>
              {isProcessing ? "Alterando..." : "Alterar Permissão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove AlertDialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remover Membro
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedMember?.user.nome_completo}</strong> do estúdio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove} disabled={isProcessing}>
              {isProcessing ? "Removendo..." : "Remover Membro"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {estudioId && currentUserId && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          estudioId={estudioId}
          currentUserId={currentUserId}
          onSuccess={refetch}
        />
      )}
    </StudioDashboardLayout>
  );
}
