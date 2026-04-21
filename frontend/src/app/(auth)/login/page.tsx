'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, FlexContainer, InputText, InputPassword, TextLink, Typography } from "@uigovpe/components";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from "../../../services/auth.service";
// Importamos nossas validações reais do projeto
import { emailSchema } from "../../../infrastructure/validations/email";
import { passwordSchema } from "@/src/infrastructure/validations/password";

const loginSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const responseData = await authService.login(data);

      // Substituímos o localStorage pelo Cookie. 
      // A flag path=/ indica que o sistema inteiro tem acesso a esse cookie.
      document.cookie = `token=${responseData.access_token}; path=/; max-age=86400`; 
      
      router.push('/dashboard'); 
      
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Typography variant="h3" size="lg" fontWeight="bold">Sistema de Gestão</Typography>
          <Typography variant="p" size="default" className="text-gray-500">Faça login para acessar o painel</Typography>
        </div>

        <Card title="Login">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FlexContainer direction="col" gap="4" justify="center" align="start">
              
              <div className="w-full">
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <InputText
                      {...field}
                      label="E-mail"
                      placeholder="admin@admin.com"
                      invalid={!!errors.email}
                      supportText={errors.email?.message}
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <Controller
                  name="senha"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <InputPassword
                      {...field}
                      label="Senha"
                      placeholder="Digite sua senha"
                      invalid={!!errors.senha}
                      supportText={errors.senha?.message}
                      keyfilter={/^\S+$/}
                    />
                  )}
                />
              </div>

              <Typography variant="div" size="small" className="w-full flex-1">
                <TextLink onClick={() => console.log('Recuperar senha')}>
                  Esqueci a minha senha
                </TextLink>
              </Typography>

              <Button type="submit" label="Entrar" className="w-full" loading={isLoading} />

            </FlexContainer>
          </form>
        </Card>
      </div>
    </div>
  );
}