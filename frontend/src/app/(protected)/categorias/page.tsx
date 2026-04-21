'use client'

import { useEffect, useState } from "react";
import { Button, Card, Typography, Dialog, InputText, InputTextarea, FlexContainer } from "@uigovpe/components";
import { categoriesService, Category } from "../../../services/categories.service";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Schema de Validação (Regras de negócio do front-end)
const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Controle do Modal (Dialog)
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Configuração do Formulário
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" }
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesService.findAll();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await categoriesService.remove(id);
      fetchCategories(); 
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao excluir categoria.");
    }
  };

  // 2. Função disparada ao salvar o formulário
  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      await categoriesService.create(data);
      setIsDialogVisible(false); // Fecha o modal
      reset(); // Limpa os campos do formulário
      fetchCategories(); // Recarrega a tabela com a nova categoria
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Erro ao criar categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para fechar o modal e limpar os dados
  const fecharModal = () => {
    setIsDialogVisible(false);
    reset();
  };

  return (
    <div className="w-full">
      {/* Cabeçalho da Página */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h3" size="xl" fontWeight="bold">
            Categorias
          </Typography>
          <Typography variant="p" className="text-gray-500">
            Gerencie as categorias dos produtos do sistema.
          </Typography>
        </div>
        
        <Button 
          label="Nova Categoria" 
          icon="add" 
          onClick={() => setIsDialogVisible(true)} 
        />
      </div>

      {/* Tabela de Dados */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando categorias...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma categoria encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Nome</th>
                  <th className="p-4 font-semibold text-gray-700">Descrição</th>
                  <th className="p-4 font-semibold text-gray-700">Criado por</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{category.name}</td>
                    <td className="p-4 text-gray-600">{category.description || "-"}</td>
                    <td className="p-4 text-gray-600">{category.owner?.name || "Desconhecido"}</td>
                    <td className="p-4 text-right">
                      {/* Corrigido para severity="danger" conforme sua orientação! */}
                      <Button 
                        label="Excluir" 
                        severity="danger" 
                        outlined /* Adicione variant="text" ou similar se quiser sem fundo, ou deixe o padrão */
                        onClick={() => handleDelete(category.id)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3. Modal de Criação (Dialog) */}
      <Dialog 
        header="Criar Nova Categoria" 
        visible={isDialogVisible} 
        onHide={fecharModal}
        style={{ width: '450px' }} // O PrimeReact aceita style direto no Dialog
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <FlexContainer direction="col" gap="4">
            
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  label="Nome da Categoria *"
                  placeholder="Ex: Eletrônicos"
                  invalid={!!errors.name}
                  supportText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  {...field}
                  label="Descrição (Opcional)"
                  placeholder="Detalhes sobre a categoria..."
                  rows={4}
                />
              )}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                label="Cancelar" 
                severity="secondary" // Usando o padrão de cores do GovPE
                onClick={fecharModal} 
                type="button" // Importante para não submeter o form sem querer
              />
              <Button 
                label="Salvar Categoria" 
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