'use client'

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dialog,
  FlexContainer,
  InputText,
  InputTextarea,
  Typography,
} from "@uigovpe/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, categoriesService } from "../../../services/categories.service";

const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const dialogTitle = useMemo(
    () => (editingCategory ? "Editar Categoria" : "Criar Nova Categoria"),
    [editingCategory],
  );

  const fetchCategories = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const data = await categoriesService.findAll();
      setCategories(data);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao buscar categorias.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      description: category.description || "",
    });
    setFeedback(null);
    setIsDialogVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      return;
    }

    try {
      await categoriesService.remove(id);
      setFeedback({ type: "success", message: "Categoria excluída com sucesso." });
      fetchCategories();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Erro ao excluir categoria.",
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, data);
        setFeedback({ type: "success", message: "Categoria atualizada com sucesso." });
      } else {
        await categoriesService.create(data);
        setFeedback({ type: "success", message: "Categoria criada com sucesso." });
      }

      closeDialog();
      fetchCategories();
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingCategory ? "Erro ao atualizar categoria." : "Erro ao criar categoria."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
    setEditingCategory(null);
    reset({ name: "", description: "" });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          onClick={() => {
            setEditingCategory(null);
            reset({ name: "", description: "" });
            setIsDialogVisible(true);
          }}
        />
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
          <div className="p-8 text-center text-gray-500">Carregando categorias...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhuma categoria encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Nome</th>
                  <th className="p-4 font-semibold text-gray-700">Descrição</th>
                  <th className="p-4 font-semibold text-gray-700">Criado por</th>
                  <th className="p-4 text-right font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{category.name}</td>
                    <td className="p-4 text-gray-600">{category.description || "-"}</td>
                    <td className="p-4 text-gray-600">{category.owner?.name || "Desconhecido"}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          label="Editar"
                          severity="secondary"
                          outlined
                          onClick={() => handleEdit(category)}
                        />
                        <Button
                          label="Excluir"
                          severity="danger"
                          outlined
                          onClick={() => handleDelete(category.id)}
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
        style={{ width: "450px" }}
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

            <div className="mt-4 flex justify-end gap-2">
              <Button label="Cancelar" severity="secondary" onClick={closeDialog} type="button" />
              <Button
                label={editingCategory ? "Salvar Alterações" : "Salvar Categoria"}
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
