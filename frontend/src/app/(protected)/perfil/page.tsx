'use client'

import { useEffect, useState, useRef } from "react";
import { Button, InputText, Icon } from "@uigovpe/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usersService, SaveUserPayload } from "../../../services/users.service";
import { authService, SessionUser } from "../../../services/auth.service";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Esquema de validação para dados básicos
const profileSchema = z.object({
  name: z.string().min(2, "O nome é muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "A nova senha deve ter pelo menos 6 caracteres",
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    // Carrega o usuário atual do armazenamento da sessão
    const currentUser = authService.getStoredUser();
    if (currentUser) {
      setUser(currentUser);
      reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
        password: ""
      });
      // Resolve a URL da imagem de perfil (mesma lógica de produtos)
      if (currentUser.avatarUrl) {
        setAvatarPreview(`${apiBaseUrl}/files/image?path=${encodeURIComponent(currentUser.avatarUrl)}`);
      }
    }
  }, [reset]);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostra a prévia da imagem instantaneamente na tela
    setAvatarPreview(URL.createObjectURL(file));

    // Faz o upload para o backend
    setIsSavingAvatar(true);
    try {
      const updatedUser = await usersService.uploadAvatar(file);

      // Atualiza o usuário no LocalStorage/Session com a nova URL do avatar
      if (user) {
        const newUserState = { ...user, avatarUrl: updatedUser.avatarUrl };
        localStorage.setItem('user', JSON.stringify(newUserState));
        setUser(newUserState);
      }
      alert("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao atualizar foto de perfil.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const onSubmitInfo = async (data: ProfileFormData) => {
    // 1. Trava de segurança que resolve o erro do 'user.id' undefined
    if (!user || !user.id) return; 

    setIsSavingInfo(true);
    try {
      const payload: SaveUserPayload = {
        name: data.name,
        email: data.email,
        // Forçamos o TypeScript a entender que a role vinda da sessão é uma dessas duas opções válidas
        role: user.role as "ADMIN" | "USER", 
        ...(data.password ? { password: data.password } : {})
      };

      // O TypeScript agora sabe que user.id é 100% string
      await usersService.update(user.id, payload); 
      
      const newUserState = { ...user, name: data.name, email: data.email };
      localStorage.setItem('user', JSON.stringify(newUserState));
      setUser(newUserState);
      
      alert("Informações atualizadas com sucesso!");
      reset({ ...data, password: "" }); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao atualizar informações.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-[#28272C]">Meu Perfil</h1>
        <p className="mt-1 text-sm text-[#494C57]">Gerencie suas informações pessoais e sua foto de perfil.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: FOTO DE PERFIL */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <Icon icon="person" className="text-6xl text-gray-400" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSavingAvatar}
                className="absolute bottom-0 right-0 h-10 w-10 bg-[#0034B7] rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-800 transition-colors shadow-md disabled:opacity-50"
                title="Mudar foto"
              >
                <Icon icon="photo_camera" />
              </button>
            </div>

            <h3 className="mt-4 font-bold text-gray-900">{user?.name}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user?.role}</p>

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
            />

            {isSavingAvatar && <p className="mt-3 text-xs text-blue-600 font-semibold animate-pulse">Enviando foto...</p>}
          </div>
        </div>

        {/* COLUNA DIREITA: INFORMAÇÕES PESSOAIS */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmitInfo)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#28272C] mb-6 border-b pb-2">Informações Pessoais</h2>

            <div className="space-y-5">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputText {...field} label="Nome Completo *" invalid={!!errors.name} supportText={errors.name?.message} />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputText {...field} type="email" label="E-mail *" invalid={!!errors.email} supportText={errors.email?.message} />
                )}
              />

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Segurança</h3>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      {...field}
                      type="password"
                      label="Nova Senha (opcional)"
                      placeholder="Deixe em branco para não alterar"
                      invalid={!!errors.password}
                      supportText={errors.password?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                label="Salvar Alterações"
                type="submit"
                loading={isSavingInfo}
                icon="save"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}