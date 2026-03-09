import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUsers, createUser, updateUser, deleteUser, type User } from "@/lib/api";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Users as UsersIcon, Pencil, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/pages/dashboard/components/DashboardHeader";
import { LoginForm } from "@/pages/login/components/LoginForm";

export default function UsersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const editRowRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      if (err instanceof Error && err.message === "FORBIDDEN") {
        setForbidden(true);
      } else {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Error al cargar usuarios",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { email?: string; password?: string } = {};
    if (!formEmail.trim()) errs.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) errs.email = "Correo no válido";
    if (!formPassword) errs.password = "La contraseña es requerida";
    else if (formPassword.length < 6) errs.password = "Mínimo 6 caracteres";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await createUser(formEmail.trim(), formPassword);
      setFormEmail("");
      setFormPassword("");
      setFormErrors({});
      toast({ title: "Usuario creado", description: "El usuario se creó correctamente." });
      fetchUsers();
    } catch (err) {
      setFormErrors({
        password: err instanceof Error ? err.message : "Error al crear usuario",
      });
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al crear usuario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    setSubmitting(true);
    try {
      const data: { email?: string; password?: string } = {};
      if (editEmail.trim()) data.email = editEmail.trim();
      if (editPassword.length >= 6) data.password = editPassword;
      if (Object.keys(data).length === 0) {
        setEditingId(null);
        setSubmitting(false);
        return;
      }
      await updateUser(editingId, data);
      setEditingId(null);
      setEditEmail("");
      setEditPassword("");
      toast({ title: "Usuario actualizado", description: "Los cambios se guardaron." });
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al actualizar",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;
    try {
      await deleteUser(id);
      toast({ title: "Usuario eliminado", description: "El usuario fue eliminado." });
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al eliminar",
        variant: "destructive",
      });
    }
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditEmail(u.email);
    setEditPassword("");
    setTimeout(() => editRowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  if (forbidden) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onLogout={logout} isAdmin={false} showDashboardLink />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">403 Forbidden</h1>
          <p className="text-muted-foreground mt-2">
            No tienes permiso para acceder a esta página. Solo administradores pueden gestionar usuarios.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Volver al Dashboard</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={logout} isAdmin={true} showDashboardLink />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UsersIcon className="w-6 h-6" />
            Gestión de usuarios
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crear usuario</CardTitle>
              <p className="text-sm text-muted-foreground">
                Solo se crean usuarios normales (rol base). Los admins se agregan manualmente en la DB.
              </p>
            </CardHeader>
            <CardContent>
              <LoginForm
                email={formEmail}
                password={formPassword}
                showPassword={formShowPassword}
                errors={formErrors}
                loading={submitting}
                onEmailChange={setFormEmail}
                onPasswordChange={setFormPassword}
                onTogglePassword={() => setFormShowPassword(!formShowPassword)}
                onSubmit={handleCreate}
                submitLabel="Crear usuario"
                submitLoadingLabel="Creando..."
                idPrefix="create-user"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : (
                <p className="text-sm text-muted-foreground">{users.length} usuario(s)</p>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Cargando...</div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No hay usuarios</div>
              ) : (
                <div className={`space-y-2 overflow-y-auto ${editingId ? "max-h-[28rem]" : "max-h-64"}`}>
                  {users.map((u) => (
                    <div
                      key={u.id}
                      ref={editingId === u.id ? editRowRef : undefined}
                      className={`rounded-md bg-muted/50 ${editingId === u.id ? "p-3" : "flex items-center justify-between gap-2 p-2"}`}
                    >
                      {editingId === u.id ? (
                        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor={`edit-email-${u.id}`} className="text-xs">Correo</Label>
                            <Input
                              id={`edit-email-${u.id}`}
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="usuario@empresa.mx"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`edit-password-${u.id}`} className="text-xs">
                              Nueva contraseña (opcional)
                            </Label>
                            <Input
                              id={`edit-password-${u.id}`}
                              type="password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="Dejar vacío para no cambiar"
                              className="h-9"
                            />
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button type="submit" size="sm" disabled={submitting}>
                              Guardar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditEmail("");
                                setEditPassword("");
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{u.email}</p>
                            <p className="text-xs text-muted-foreground">{u.role}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {u.role !== "admin" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => startEdit(u)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(u.id, u.email)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
