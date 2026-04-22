'use client'

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  FlexContainer,
  InputPassword,
  InputText,
  Typography,
} from "@uigovpe/components";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../../../services/auth.service";
import { User, usersService } from "../../../services/users.service";

const userSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O email informado é inválido."),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const dialogTitle = useMemo(
    () => (editingUser ? "Editar Usuário" : "Novo Usuário"),
    [editingUser],
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const data = await usersService.findAll();
      setUsers(data);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao buscar usuários.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setCurrentRole(storedUser?.role || null);

    if (storedUser?.role === "ADMIN") {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, []);

  const openCreateDialog = () => {
    setEditingUser(null);
    reset({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });
    setIsDialogVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsDialogVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
      return;
    }

    try {
      await usersService.remove(id);
      setFeedback({ type: "success", message: "Usuário excluído com sucesso." });
      fetchUsers();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir usuário.",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!editingUser && !data.password) {
      setFeedback({ type: "error", message: "A senha é obrigatória para criar um usuário." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      if (editingUser) {
        await usersService.update(editingUser.id, data);
        setFeedback({ type: "success", message: "Usuário atualizado com sucesso." });
      } else {
        await usersService.create(data as Required<UserFormData>);
        setFeedback({ type: "success", message: "Usuário criado com sucesso." });
      }

      closeDialog();
      fetchUsers();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingUser ? "Erro ao atualizar usuário." : "Erro ao criar usuário."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setEditingUser(null);
    reset({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });
  };

  if (currentRole && currentRole !== "ADMIN") {
    return (
      <Card>
        <div className="p-8 text-center">
          <Typography variant="h4" size="lg" fontWeight="bold">
            Acesso restrito
          </Typography>
          <Typography variant="p" className="mt-2 text-gray-500">
            Apenas administradores podem acessar o gerenciamento de usuários.
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h3" size="xl" fontWeight="bold">
            Usuários
          </Typography>
          <Typography variant="p" className="text-gray-500">
            Gerencie os usuários do sistema.
          </Typography>
        </div>

        <Button label="Novo Usuário" icon="add" onClick={openCreateDialog} />
      </div>

      {feedback ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Nome</th>
                  <th className="p-4 font-semibold text-gray-700">Email</th>
                  <th className="p-4 font-semibold text-gray-700">Perfil</th>
                  <th className="p-4 text-right font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{user.name || "-"}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">{user.role}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          label="Editar"
                          severity="secondary"
                          outlined
                          onClick={() => handleEdit(user)}
                        />
                        <Button
                          label="Excluir"
                          severity="danger"
                          outlined
                          onClick={() => handleDelete(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        header={dialogTitle}
        visible={isDialogVisible}
        onHide={closeDialog}
        style={{ width: "460px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Nome *"
                  invalid={!!errors.name}
                  supportText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Email *"
                  invalid={!!errors.email}
                  supportText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputPassword
                  {...field}
                  label={editingUser ? "Nova senha (opcional)" : "Senha *"}
                  invalid={!!errors.password}
                  supportText={errors.password?.message}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="w-full">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Perfil</label>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              )}
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button label="Cancelar" severity="secondary" onClick={closeDialog} type="button" />
              <Button
                label={editingUser ? "Salvar Alterações" : "Salvar Usuário"}
                type="submit"
                loading={isSaving}
              />
            </div>
          </FlexContainer>
        </form>
      </Dialog>
    </div>
  );
}
